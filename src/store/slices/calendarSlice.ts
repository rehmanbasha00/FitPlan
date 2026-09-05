import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent } from '@/types';

interface CalendarState {
  events: CalendarEvent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  visibleMonth: string; // YYYY-MM
  selectedDate: string | null; // YYYY-MM-DD
  selectedEventId: string | null;
  view: 'calendar' | 'list';
}

const initialState: CalendarState = {
  events: [],
  status: 'idle',
  error: null,
  visibleMonth: '2023-12',
  selectedDate: '2023-12-11',
  selectedEventId: null,
  view: 'calendar'
};

export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async () => {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error('Failed to load schedule');
  return (await res.json()) as CalendarEvent[];
});

const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    goToNextMonth(state) {
      state.visibleMonth = shiftMonth(state.visibleMonth, 1);
    },
    goToPrevMonth(state) {
      state.visibleMonth = shiftMonth(state.visibleMonth, -1);
    },
    selectDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    selectEvent(state, action: PayloadAction<string | null>) {
      state.selectedEventId = action.payload;
    },
    setView(state, action: PayloadAction<'calendar' | 'list'>) {
      state.view = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      });
  }
});

export const { goToNextMonth, goToPrevMonth, selectDate, selectEvent, setView } = calendarSlice.actions;
export default calendarSlice.reducer;
