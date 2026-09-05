'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import ScheduleGrid from './ScheduleGrid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goToNextMonth, goToPrevMonth, selectDate, selectEvent } from '@/store/slices/calendarSlice';
import Skeleton from '@/components/ui/Skeleton';
import EventCard from './EventCard';

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })
);

// All date math is done with UTC components so a 'YYYY-MM-DD' string always
// round-trips to the same string, regardless of the browser's local timezone.
function getWeekDays(monthKey: string, selectedDate: string | null) {
  const [year, month] = monthKey.split('-').map(Number);
  const [aY, aM, aD] = (selectedDate ?? `${year}-${String(month).padStart(2, '0')}-10`)
    .split('-')
    .map(Number);
  const anchor = new Date(Date.UTC(aY, aM - 1, aD));
  const start = new Date(anchor);
  start.setUTCDate(anchor.getUTCDate() - anchor.getUTCDay());

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      date: iso,
      label: `${d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })} ${d.getUTCDate()}`,
      isSelected: iso === selectedDate
    };
  });
}

export default function UpcomingSchedule() {
  const dispatch = useAppDispatch();
  const { events, visibleMonth, selectedDate, view, status } = useAppSelector((s) => s.calendar);
  const days = useMemo(() => getWeekDays(visibleMonth, selectedDate), [visibleMonth, selectedDate]);
  const [year, monthNum] = visibleMonth.split('-').map(Number);
  const monthLabel = `${MONTH_LABELS[monthNum - 1]} ${year}`;

  return (
    <section className="mt-4 rounded-3xl bg-white p-4 shadow-soft sm:p-6" aria-labelledby="schedule-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="schedule-heading" className="text-xl font-bold text-ink">
            Upcoming Schedule
          </h2>
          <Link href="/trips" className="focus-ring text-xs font-medium text-accent hover:underline">
            Manage all trips →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => dispatch(goToPrevMonth())}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted hover:bg-surface-shell"
          >
            ‹
          </button>
          <span className="rounded-full bg-surface-muted px-4 py-1.5 text-sm font-medium text-ink">
            📅 {monthLabel}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => dispatch(goToNextMonth())}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted hover:bg-surface-shell"
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Calendar view"
            className="focus-ring ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted shadow-soft"
          >
            📆
          </button>
        </div>
      </div>

      <div className="mt-4">
        {status === 'loading' ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : status === 'failed' ? (
          <p role="alert" className="text-sm text-red-500">
            Something went wrong loading the schedule.
          </p>
        ) : view === 'calendar' ? (
          <ScheduleGrid
            days={days}
            events={events}
            onSelectDate={(date) => dispatch(selectDate(date))}
            onSelectEvent={(id) => dispatch(selectEvent(id))}
          />
        ) : events.length === 0 ? (
          <p className="text-sm text-ink-soft">No events scheduled for this period.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} onSelect={(id) => dispatch(selectEvent(id))} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
