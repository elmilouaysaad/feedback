'use client';

import { useEffect, useState } from 'react';
import { FeedbackTablet } from '@/app/components/FeedbackTablet';
import type { Event } from '@/app/lib/db';

interface HomeClientProps {
  tabletCode: string;
}

export function HomeClient({ tabletCode }: HomeClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const tabletQuery = tabletCode ? `?tablet=${encodeURIComponent(tabletCode)}` : '';
        const response = await fetch(`/api/events/current${tabletQuery}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data.event);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('No active event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();

    const interval = setInterval(fetchEvent, 100);

    return () => clearInterval(interval);
  }, [tabletCode]);

  const handleFeedbackSubmit = async (rating: number) => {
    try {
      const tabletQuery = tabletCode ? `?tablet=${encodeURIComponent(tabletCode)}` : '';
      const response = await fetch(`/api/feedback${tabletQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full border border-slate-200 bg-slate-50"></div>
          <p className="text-xl text-slate-600">Loading current event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-screen w-full overflow-hidden items-center justify-center bg-white px-6">
        <div className="max-w-xl text-center">
          <p className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">No active event</p>
          <p className="text-lg text-slate-500 md:text-2xl">Please ask an administrator to activate an event before using this page.</p>
        </div>
      </div>
    );
  }

  return <FeedbackTablet eventName={event.name} tabletCode={tabletCode} onFeedbackSubmit={handleFeedbackSubmit} />;
}