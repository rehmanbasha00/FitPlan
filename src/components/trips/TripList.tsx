'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTrips } from '@/store/slices/tripSlice';
import { openCreateTrip } from '@/store/slices/uiSlice';
import TripCard from './TripCard';
import TripFilters from './TripFilters';
import TripDetails from './TripDetails';
import EditTripModal from './EditTripModal';
import DeleteTripDialog from './DeleteTripDialog';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function TripList() {
  const dispatch = useAppDispatch();
  const { items, status, error, filters } = useAppSelector((s) => s.trips);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let results = [...items];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q));
    }
    if (filters.status !== 'all') {
      results = results.filter((t) => t.status === filters.status);
    }
    if (filters.sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'status') {
      results.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      results.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    return results;
  }, [items, filters]);

  const viewingTrip = items.find((t) => t.id === viewingId) ?? null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">Trip Management</h2>
        <Button onClick={() => dispatch(openCreateTrip())}>+ New trip</Button>
      </div>

      <div className="mt-4">
        <TripFilters />
      </div>

      <div className="mt-4">
        {status === 'loading' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : status === 'failed' ? (
          <div role="alert" className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
            <p>Something went wrong loading your trips.</p>
            <Button className="mt-3" variant="secondary" onClick={() => dispatch(fetchTrips())}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-surface-muted p-8 text-center">
            <p className="text-sm text-ink-soft">No trips found.</p>
            <Button className="mt-3" onClick={() => dispatch(openCreateTrip())}>
              Create Trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} onView={setViewingId} />
            ))}
          </div>
        )}
      </div>

      {error && status === 'failed' && <p className="sr-only">{error}</p>}

      <TripDetails trip={viewingTrip} onClose={() => setViewingId(null)} />
      <EditTripModal />
      <DeleteTripDialog />
    </section>
  );
}
