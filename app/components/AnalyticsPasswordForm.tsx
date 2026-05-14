'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AnalyticsPasswordFormProps {
  onSuccess?: () => void;
}

export function AnalyticsPasswordForm({ onSuccess }: AnalyticsPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/analytics-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Analytics password updated successfully' });
        setPassword('');
        setConfirmPassword('');
        setShowForm(false);
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: 'Failed to update password' });
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage({ type: 'error', text: 'Error updating password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-slate-600" />
        <h3 className="text-xl font-semibold text-slate-900">Analytics Password</h3>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-500">
        Add or change the password required to access the public analytics page.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 w-full"
        >
          Set Analytics Password
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              disabled={isLoading}
            />
          </div>

          {message && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setMessage(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
