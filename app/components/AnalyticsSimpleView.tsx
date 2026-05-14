'use client';

import type { EventStats } from '@/app/lib/db';

interface AnalyticsSimpleProps {
  stats: EventStats;
}

export function AnalyticsSimpleView({ stats }: AnalyticsSimpleProps) {
  const getPercentage = (count: number): string => {
    if (stats.total_votes === 0) return '0%';
    return ((count / stats.total_votes) * 100).toFixed(1) + '%';
  };

  const getAverageRating = (): number => {
    if (stats.total_votes === 0) return 0;
    const total =
      stats.rating_1 * 1 +
      stats.rating_2 * 2 +
      stats.rating_3 * 3 +
      stats.rating_4 * 4 +
      stats.rating_5 * 5;
    return parseFloat((total / stats.total_votes).toFixed(2));
  };

  const ratings = [
    { label: 'Terrible', count: stats.rating_1, color: '#ef4444', ratio: stats.rating_1 / Math.max(stats.total_votes, 1) },
    { label: 'Poor', count: stats.rating_2, color: '#f97316', ratio: stats.rating_2 / Math.max(stats.total_votes, 1) },
    { label: 'Neutral', count: stats.rating_3, color: '#eab308', ratio: stats.rating_3 / Math.max(stats.total_votes, 1) },
    { label: 'Good', count: stats.rating_4, color: '#84cc16', ratio: stats.rating_4 / Math.max(stats.total_votes, 1) },
    { label: 'Great', count: stats.rating_5, color: '#22c55e', ratio: stats.rating_5 / Math.max(stats.total_votes, 1) },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{stats.event_name}</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>Total responses: {stats.total_votes}</span>
          <span>Average rating: {getAverageRating()} / 5.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {ratings.map((rating, index) => (
          <div
            key={index}
            className="border border-slate-200 px-4 py-4 text-center"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{rating.label}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{rating.count}</div>
            <div className="mt-1 text-xs text-slate-500">{getPercentage(rating.count)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="font-medium text-slate-800">{rating.label}</span>
              <span className="text-sm text-slate-500">{rating.count} votes ({getPercentage(rating.count)})</span>
            </div>
            <div className="h-3 w-full overflow-hidden bg-slate-100">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.max(rating.ratio * 100, 5)}%`,
                  backgroundColor: rating.color,
                }}
              >
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="text-2xl font-semibold text-emerald-700">{stats.rating_5 + stats.rating_4}</div>
          <div className="mt-1 text-sm text-slate-700">Positive (Good/Great)</div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.total_votes > 0 ? (((stats.rating_5 + stats.rating_4) / stats.total_votes) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="text-2xl font-semibold text-amber-700">{stats.rating_3}</div>
          <div className="mt-1 text-sm text-slate-700">Neutral</div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.total_votes > 0 ? (((stats.rating_3) / stats.total_votes) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="border border-rose-200 bg-rose-50 px-5 py-4">
          <div className="text-2xl font-semibold text-rose-700">{stats.rating_1 + stats.rating_2}</div>
          <div className="mt-1 text-sm text-slate-700">Negative (Poor/Terrible)</div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.total_votes > 0 ? (((stats.rating_1 + stats.rating_2) / stats.total_votes) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
