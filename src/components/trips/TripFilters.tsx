'use client';

import Dropdown from '@/components/ui/Dropdown';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch, setSortBy, setStatusFilter } from '@/store/slices/tripSlice';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' as const },
  { label: 'Upcoming', value: 'upcoming' as const },
  { label: 'Ongoing', value: 'ongoing' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Cancelled', value: 'cancelled' as const }
];

const SORT_OPTIONS = [
  { label: 'Sort by date', value: 'date' as const },
  { label: 'Sort by name', value: 'name' as const },
  { label: 'Sort by status', value: 'status' as const }
];

export default function TripFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.trips);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="trip-search" className="sr-only">
        Search trips
      </label>
      <input
        id="trip-search"
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder="Search trips by name or destination..."
        className="focus-ring h-10 min-w-[200px] flex-1 rounded-full bg-surface-muted px-4 text-sm placeholder:text-ink-soft/70"
      />
      <Dropdown options={STATUS_OPTIONS} value={filters.status} onChange={(v) => dispatch(setStatusFilter(v))} />
      <Dropdown options={SORT_OPTIONS} value={filters.sortBy} onChange={(v) => dispatch(setSortBy(v))} />
    </div>
  );
}
