'use client';

import { useEffect, useState } from 'react';
import { AnalyticsSimpleView } from '@/app/components/AnalyticsSimpleView';
import { Lock } from 'lucide-react';
import type { EventStats } from '@/app/lib/db';

export default function PublicAnalyticsPage() {
  const [stats, setStats] = useState<EventStats[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const authToken = localStorage.getItem('analyticsAuth');
        
        // Check if analytics requires password
        const verifyResponse = await fetch('/api/analytics/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: authToken || '' }),
        });

        if (verifyResponse.status === 401) {
          // Password is required and token is invalid
          setRequiresPassword(true);
          setIsAuthenticated(false);
        } else if (verifyResponse.ok) {
          // Either no password is set, or password is correct
          setIsAuthenticated(true);
          setRequiresPassword(false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        // Assume no password required on error
        setIsAuthenticated(true);
        setRequiresPassword(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          if (data.stats.length > 0) {
            setSelectedEventId(data.stats[0].event_id);
          }
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 5 seconds
    const interval = setInterval(fetchStats, 100);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const currentStats = stats.find((s) => s.event_id === selectedEventId) || null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const response = await fetch('/api/analytics/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.setItem('analyticsAuth', password);
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setPasswordError('Invalid password');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setPasswordError('Error verifying password');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Lock className="h-8 w-8 text-slate-600" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mb-8 text-center text-lg text-slate-500">
            This page is password protected
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-rose-600">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 text-lg font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              Unlock Analytics
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            Feedback Analytics
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Feedback Analytics</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-500 md:text-lg">Read-only analytics view (password protected)</p>
        </div>
      </div>

      {/* Event Selector */}
      {stats.length > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Event</h3>
          <div className="flex flex-wrap gap-3">
            {stats.map((stat) => (
              <button
                key={stat.event_id}
                onClick={() => setSelectedEventId(stat.event_id)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedEventId === stat.event_id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {stat.event_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {currentStats ? (
        <AnalyticsSimpleView stats={currentStats} />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No events available</p>
        </div>
      )}
    </div>
  );
}
