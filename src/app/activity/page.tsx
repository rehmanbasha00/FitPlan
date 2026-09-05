'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTrips } from '@/store/slices/tripSlice';
import { fetchEvents } from '@/store/slices/calendarSlice';
import Skeleton from '@/components/ui/Skeleton';

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const { items: trips, status: tripStatus } = useAppSelector((s) => s.trips);
  const { events, status: eventStatus } = useAppSelector((s) => s.calendar);

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchEvents());
  }, [dispatch]);

  const loading = tripStatus === 'loading' || eventStatus === 'loading';

  return (
    <DashboardLayout>
      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-ink">Activity</h1>
        <p className="mt-1 text-sm text-ink-soft">A timeline of your recent trips and scheduled events.</p>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {[...trips.map((t) => ({ id: t.id, label: t.name, sub: `${t.startDate} · ${t.destination}` })),
              ...events.map((e) => ({ id: e.id, label: e.title, sub: `${e.date} · ${e.time}` }))]
              .sort((a, b) => a.sub.localeCompare(b.sub))
              .map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-dark">●</span>
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink-soft">{item.sub}</p>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
