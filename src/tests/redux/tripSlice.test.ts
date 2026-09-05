import { describe, expect, it } from 'vitest';
import tripReducer, { setSearch, setStatusFilter, setSortBy, fetchTrips, createTrip, deleteTrip } from '@/store/slices/tripSlice';
import { initialTrips } from '@/data/mockData';

describe('tripSlice reducers', () => {
  const baseState = {
    items: [],
    status: 'idle' as const,
    error: null,
    filters: { search: '', status: 'all' as const, sortBy: 'date' as const }
  };

  it('updates the search filter', () => {
    const state = tripReducer(baseState, setSearch('switzerland'));
    expect(state.filters.search).toBe('switzerland');
  });

  it('updates the status filter', () => {
    const state = tripReducer(baseState, setStatusFilter('completed'));
    expect(state.filters.status).toBe('completed');
  });

  it('updates the sort option', () => {
    const state = tripReducer(baseState, setSortBy('name'));
    expect(state.filters.sortBy).toBe('name');
  });

  it('marks status as loading on fetchTrips.pending', () => {
    const state = tripReducer(baseState, { type: fetchTrips.pending.type });
    expect(state.status).toBe('loading');
  });

  it('stores trips on fetchTrips.fulfilled', () => {
    const state = tripReducer(baseState, { type: fetchTrips.fulfilled.type, payload: initialTrips });
    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(initialTrips.length);
  });

  it('records an error message on fetchTrips.rejected', () => {
    const state = tripReducer(baseState, {
      type: fetchTrips.rejected.type,
      error: { message: 'Network error' }
    });
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  it('prepends a new trip on createTrip.fulfilled', () => {
    const seeded = { ...baseState, items: initialTrips };
    const newTrip = { ...initialTrips[0], id: 'trip-new', name: 'New Adventure' };
    const state = tripReducer(seeded, { type: createTrip.fulfilled.type, payload: newTrip });
    expect(state.items[0].id).toBe('trip-new');
    expect(state.items).toHaveLength(initialTrips.length + 1);
  });

  it('removes a trip on deleteTrip.fulfilled', () => {
    const seeded = { ...baseState, items: initialTrips };
    const target = initialTrips[0].id;
    const state = tripReducer(seeded, { type: deleteTrip.fulfilled.type, payload: target });
    expect(state.items.find((t) => t.id === target)).toBeUndefined();
  });
});
