import { describe, expect, it } from 'vitest';
import calendarReducer, { goToNextMonth, goToPrevMonth, selectDate, selectEvent, setView } from '@/store/slices/calendarSlice';

describe('calendarSlice reducers', () => {
  const baseState = {
    events: [],
    status: 'idle' as const,
    error: null,
    visibleMonth: '2023-12',
    selectedDate: '2023-12-11',
    selectedEventId: null,
    view: 'calendar' as const
  };

  it('advances to the next month', () => {
    const state = calendarReducer(baseState, goToNextMonth());
    expect(state.visibleMonth).toBe('2024-01');
  });

  it('rolls back to the previous month', () => {
    const state = calendarReducer(baseState, goToPrevMonth());
    expect(state.visibleMonth).toBe('2023-11');
  });

  it('updates the selected date', () => {
    const state = calendarReducer(baseState, selectDate('2023-12-14'));
    expect(state.selectedDate).toBe('2023-12-14');
  });

  it('selects and clears an event', () => {
    const selected = calendarReducer(baseState, selectEvent('evt-camping'));
    expect(selected.selectedEventId).toBe('evt-camping');
    const cleared = calendarReducer(selected, selectEvent(null));
    expect(cleared.selectedEventId).toBeNull();
  });

  it('toggles between calendar and list view', () => {
    const state = calendarReducer(baseState, setView('list'));
    expect(state.view).toBe('list');
  });
});
