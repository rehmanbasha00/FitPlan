import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip, TripStatus } from '@/types';

export interface TripFilters {
  search: string;
  status: TripStatus | 'all';
  sortBy: 'date' | 'name' | 'status';
}

interface TripState {
  items: Trip[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: TripFilters;
}

const initialState: TripState = {
  items: [],
  status: 'idle',
  error: null,
  filters: { search: '', status: 'all', sortBy: 'date' }
};

export const fetchTrips = createAsyncThunk('trips/fetchTrips', async () => {
  const res = await fetch('/api/trips');
  if (!res.ok) throw new Error('Failed to load trips');
  return (await res.json()) as Trip[];
});

export const createTrip = createAsyncThunk('trips/createTrip', async (trip: Omit<Trip, 'id'>) => {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip)
  });
  if (!res.ok) throw new Error('Failed to create trip');
  return (await res.json()) as Trip;
});

export const updateTrip = createAsyncThunk('trips/updateTrip', async (trip: Trip) => {
  const res = await fetch(`/api/trips/${trip.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip)
  });
  if (!res.ok) throw new Error('Failed to update trip');
  return (await res.json()) as Trip;
});

export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (id: string) => {
  const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete trip');
  return id;
});

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<TripStatus | 'all'>) {
      state.filters.status = action.payload;
    },
    setSortBy(state, action: PayloadAction<TripFilters['sortBy']>) {
      state.filters.sortBy = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  }
});

export const { setSearch, setStatusFilter, setSortBy } = tripSlice.actions;
export default tripSlice.reducer;
