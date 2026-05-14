'use client';

import { useState } from 'react';
import { Check, EyeOff, Plus, RotateCcw, Search } from 'lucide-react';
import type { Event } from '@/app/lib/db';

interface EventManagerProps {
  events: Event[];
  activeEventId: number | null;
  searchTerm: string;
  onCreateEvent: (name: string) => Promise<void>;
  onSetActive: (eventId: number) => Promise<void>;
  onHideEvent: (eventId: number) => Promise<void>;
  onRestoreEvent: (eventId: number) => Promise<void>;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

export function EventManager({
  events,
  activeEventId,
  searchTerm,
  onCreateEvent,
  onSetActive,
  onHideEvent,
  onRestoreEvent,
  onSearchChange,
  isLoading = false,
}: EventManagerProps) {
  const [newEventName, setNewEventName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateEvent(newEventName);
      setNewEventName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter((event) => event.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <h3 className="text-2xl font-semibold text-slate-900">Events</h3>
        <div className="text-sm text-slate-500">Hide instead of delete</div>
      </div>

      {/* Create Event Form */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Create Event</h4>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateEvent()}
            placeholder="Enter event name..."
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            disabled={isSubmitting || isLoading}
          />
          <button
            onClick={handleCreateEvent}
            disabled={isSubmitting || isLoading || !newEventName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </div>
      </div>

      {/* Search and Events List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-sm text-slate-500">
          <span>{filteredEvents.length} events</span>
          <span>Active items stay visible</span>
        </div>

        <div className="divide-y divide-slate-200 border-t border-slate-200">
          {filteredEvents.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No matching events.</p>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="truncate text-lg font-semibold text-slate-900">{event.name}</div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.is_hidden ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                      {event.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                    {event.is_active && (
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">Active</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">Created {new Date(event.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!event.is_active && !event.is_hidden && (
                    <button
                      onClick={() => onSetActive(event.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Activate
                    </button>
                  )}

                  {!event.is_hidden ? (
                    <button
                      onClick={() => onHideEvent(event.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestoreEvent(event.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </button>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
