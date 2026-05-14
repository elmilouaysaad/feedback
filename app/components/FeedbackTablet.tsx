'use client';

import { useEffect, useState, useCallback } from 'react';
import { Angry, Frown, Laugh, Meh, Smile, Heart } from 'lucide-react';

interface SmileyButtonProps {
  rating: number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function SmileyButton({ rating, icon, label, onClick }: SmileyButtonProps) {
  const accents = {
    1: 'text-rose-600 hover:bg-rose-50/60',
    2: 'text-orange-500 hover:bg-orange-50/60',
    3: 'text-amber-500 hover:bg-amber-50/60',
    4: 'text-lime-600 hover:bg-lime-50/60',
    5: 'text-emerald-600 hover:bg-emerald-50/60',
  };

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-4 px-6 py-8 transition-colors duration-200 active:scale-[0.99] md:px-8 md:py-10 ${accents[rating as keyof typeof accents]}`}
      aria-label={label}
    >
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-transparent text-7xl md:h-40 md:w-40 md:text-8xl">
        {icon}
      </div>
      <span className="text-lg font-semibold text-slate-900 md:text-2xl">{label}</span>
    </button>
  );
}

interface FeedbackTabletProps {
  eventName: string;
  tabletCode?: string;
  onFeedbackSubmit: (rating: number) => Promise<void>;
  isLoading?: boolean;
}

export function FeedbackTablet({ eventName, tabletCode = '', onFeedbackSubmit, isLoading = false }: FeedbackTabletProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(eventName);

  // Simulate real-time event updates (polling)
  useEffect(() => {
    const interval = setInterval(() => {
      const tabletQuery = tabletCode ? `?tablet=${encodeURIComponent(tabletCode)}` : '';

      fetch(`/api/events/current${tabletQuery}`)
        .then(res => res.json())
        .then(data => {
          if (data.event && data.event.name !== currentEvent) {
            setCurrentEvent(data.event.name);
            setHasSubmitted(false); // Reset on event change
          }
        })
        .catch(err => console.error('Error checking for event update:', err));
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [currentEvent, tabletCode]);

  const handleSubmit = useCallback(
    async (rating: number) => {
      if (isLoading) return;

      try {
        await onFeedbackSubmit(rating);
        setHasSubmitted(true);

        // Show thank you message for 1 second
        setTimeout(() => {
          setHasSubmitted(false);
        }, 1000);
      } catch (error) {
        console.error('Feedback submission failed:', error);
      }
    },
    [onFeedbackSubmit, isLoading]
  );

  if (hasSubmitted) {
    return (
      <div className="flex h-screen w-full overflow-hidden items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 md:h-40 md:w-40">
            <Heart className="h-16 w-16 text-rose-500 md:h-24 md:w-24" />
          </div>
          <h1 className="mb-4 text-5xl font-semibold tracking-tight text-slate-900 md:text-7xl">Thank you!</h1>
          <p className="text-2xl text-slate-600 md:text-4xl">Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col justify-center bg-white px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto my-16 w-full max-w-5xl text-center md:mb-24">
        <h1 className="mb-8 text-4xl font-semibold tracking-tight text-slate-900 md:mb-12 md:text-7xl">
          How was your experience?
        </h1>
        <p className="text-lg text-slate-500 md:text-2xl">
          Current event: <span className="font-semibold text-slate-800">{currentEvent}</span>
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
        <SmileyButton
          rating={1}
          icon={<Angry className="h-full w-full" />}
          label="Terrible"
          onClick={() => handleSubmit(1)}
        />
        <SmileyButton
          rating={2}
          icon={<Frown className="h-full w-full" />}
          label="Poor"
          onClick={() => handleSubmit(2)}
        />
        <SmileyButton
          rating={3}
          icon={<Meh className="h-full w-full" />}
          label="Neutral"
          onClick={() => handleSubmit(3)}
        />
        <SmileyButton
          rating={4}
          icon={<Smile className="h-full w-full" />}
          label="Good"
          onClick={() => handleSubmit(4)}
        />
        <SmileyButton
          rating={5}
          icon={<Laugh className="h-full w-full" />}
          label="Great"
          onClick={() => handleSubmit(5)}
        />
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 md:text-lg">
        <p>Tap one face to continue.</p>
      </div>
    </div>
  );
}
