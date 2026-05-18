'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/app/components/AdminLogin';
import { EventManager } from '@/app/components/EventManager';
import { AnalyticsSimpleView } from '@/app/components/AnalyticsSimpleView';
import { PasswordManagement } from '@/app/components/PasswordManagement';
import { Copy, Link2, LogOut, ShieldCheck, TabletSmartphone } from 'lucide-react';
import type { Event, EventStats, TabletAssignment } from '@/app/lib/db';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats[]>([]);
  const [tablets, setTablets] = useState<TabletAssignment[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsMode, setAnalyticsMode] = useState<'all' | 'by-event'>('all');
  const [tabletCode, setTabletCode] = useState('');
  const [tabletEventId, setTabletEventId] = useState<number | ''>('');
  const [siteOrigin, setSiteOrigin] = useState('');

  // Check authentication on mount
  useEffect(() => {
    setSiteOrigin(window.location.origin);
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchEvents();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?includeHidden=true');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        const active = data.events.find((e: Event) => e.is_active);
        setActiveEventId(active?.id || null);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchTablets = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/tablets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTablets(data.tablets);
      }
    } catch (err) {
      console.error('Error fetching tablet assignments:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics?includeHidden=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      fetchStats();
      fetchTablets();

      // Refresh stats every 5 seconds
      const interval = setInterval(fetchStats, 100);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchEvents();
    fetchStats();
    fetchTablets();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setEvents([]);
    setStats([]);
    router.push('/');
  };

  const handleCreateEvent = async (name: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        await fetchEvents();
        await fetchStats();
      }
    } catch (err) {
      console.error('Error creating event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveEvent = async (eventId: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        await fetchEvents();
        await fetchStats();
        setSelectedEventId(eventId);
        setAnalyticsMode('by-event');
      }
    } catch (err) {
      console.error('Error setting active event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideEvent = async (eventId: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchEvents();
        await fetchStats();
      }
    } catch (err) {
      console.error('Error hiding event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreEvent = async (eventId: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        await fetchEvents();
        await fetchStats();
      }
    } catch (err) {
      console.error('Error restoring event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTablet = async () => {
    if (!tabletCode.trim()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/tablets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: tabletCode,
          eventId: tabletEventId || null,
        }),
      });

      if (response.ok) {
        await fetchTablets();
        setTabletCode('');
        setTabletEventId('');
      }
    } catch (err) {
      console.error('Error saving tablet assignment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTablet = async (code: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/tablets?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTablets();
      }
    } catch (err) {
      console.error('Error deleting tablet assignment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTabletUrl = async (code: string) => {
    const url = `${window.location.origin}/?tablet=${encodeURIComponent(code)}`;
    await navigator.clipboard.writeText(url);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const displayEventId = selectedEventId || activeEventId;
  const currentStats = stats.find((s) => s.event_id === displayEventId);
  const visibleStats = stats.filter((stat) => {
    if (searchTerm.trim()) {
      return stat.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-6 md:px-8 md:py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Console
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-500 md:text-lg">
            Manage events, switch the active session, and review live analytics in one place.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <EventManager
            events={events}
            activeEventId={activeEventId}
            searchTerm={searchTerm}
            onCreateEvent={handleCreateEvent}
            onSetActive={handleSetActiveEvent}
            onHideEvent={handleHideEvent}
            onRestoreEvent={handleRestoreEvent}
            onSearchChange={setSearchTerm}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TabletSmartphone className="h-5 w-5 text-sky-600" />
              <h3 className="text-xl font-semibold text-slate-900">Tablet Addresses</h3>
            </div>
            <p className="mb-4 text-sm leading-6 text-slate-500">
              Create a custom tablet address like <span className="font-medium text-slate-700">/?tablet=lobby</span> and bind it to one event.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={tabletCode}
                onChange={(e) => setTabletCode(e.target.value)}
                placeholder="tablet code e.g. lobby"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />

              <select
                value={tabletEventId}
                onChange={(e) => setTabletEventId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="">Use no event yet</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveTablet}
                disabled={isLoading || !tabletCode.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Save Tablet
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {tablets.length === 0 ? (
                <p className="text-sm text-slate-500">No tablet URLs created yet.</p>
              ) : (
                tablets.map((tablet) => (
                  <div key={tablet.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">/?tablet={tablet.code}</div>
                        <div className="text-sm text-slate-500">{tablet.event_name || 'No event assigned'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyTabletUrl(tablet.code)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteTablet(tablet.code)}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Link2 className="h-3.5 w-3.5" />
                      {siteOrigin || 'Current site'}/?tablet={tablet.code}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <PasswordManagement />
        </div>
      </div>

      <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Switch between a full event view and a single event view.</p>
          </div>
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setAnalyticsMode('all')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${analyticsMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setAnalyticsMode('by-event')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${analyticsMode === 'by-event' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              By Event
            </button>
          </div>
        </div>

        {analyticsMode === 'all' ? (
          <div className="space-y-3">
            {visibleStats.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No matching analytics.</p>
            ) : (
              visibleStats.map((stat) => (
                <button
                  key={stat.event_id}
                  onClick={() => {
                    setSelectedEventId(stat.event_id);
                    setAnalyticsMode('by-event');
                  }}
                  className="flex w-full items-center justify-between border-b border-slate-200 py-4 text-left transition last:border-b-0 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{stat.event_name}</div>
                    <div className="text-sm text-slate-500">{stat.total_votes} responses</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-slate-900">{stat.total_votes}</div>
                    <div className="text-xs text-slate-500">tap to view</div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : currentStats ? (
          <AnalyticsSimpleView stats={currentStats} />
        ) : (
          <p className="py-8 text-center text-slate-500">Select an event to view its analytics.</p>
        )}
      </div>
    </div>
  );
}
