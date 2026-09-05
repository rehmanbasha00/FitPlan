'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goToNextMonth, goToPrevMonth } from '@/store/slices/calendarSlice';

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })
);

export default function CalendarHeader() {
  const dispatch = useAppDispatch();
  const { visibleMonth } = useAppSelector((s) => s.calendar);
  const [year, month] = visibleMonth.split('-').map(Number);

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-ink">Calendar</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => dispatch(goToPrevMonth())}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted hover:bg-surface-shell"
        >
          ‹
        </button>
        <span className="rounded-full bg-surface-muted px-4 py-1.5 text-sm font-medium text-ink">
          {MONTH_LABELS[month - 1]} {year}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => dispatch(goToNextMonth())}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted hover:bg-surface-shell"
        >
          ›
        </button>
      </div>
    </div>
  );
}
