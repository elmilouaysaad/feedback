'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Invalid password');
        return;
      }

      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      onLoginSuccess();
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100">
            <Lock className="h-8 w-8" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            <Sparkles className="h-3.5 w-3.5" />
            Secure Admin Access
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter the password that matches your current `.env.local` setup.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShieldCheck className="h-4 w-4" />
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs leading-5 text-slate-500">
          If <span className="font-medium text-slate-700">ADMIN_PASSWORD_HASH</span> is set, use the matching plaintext password.
          <br />
          Otherwise the development password is <span className="font-semibold text-slate-700">admin123</span>.
        </div>
      </div>
    </div>
  );
}
