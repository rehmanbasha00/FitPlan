'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDate, selectEvent } from '@/store/slices/calendarSlice';
import CalendarEventPill from './CalendarEvent';

function getMonthMatrix(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: { date: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: '', day: 0, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: iso, day: d, inMonth: true });
  }
  return cells;
}

export default function CalendarGrid() {
  const dispatch = useAppDispatch();
  const { visibleMonth, selectedDate, events } = useAppSelector((s) => s.calendar);
  const cells = useMemo(() => getMonthMatrix(visibleMonth), [visibleMonth]);

  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-soft">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const dayEvents = cell.inMonth ? events.filter((e) => e.date === cell.date) : [];
          return (
            <button
              key={idx}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => cell.inMonth && dispatch(selectDate(cell.date))}
              className={`focus-ring min-h-[84px] rounded-2xl border p-1.5 text-left align-top text-xs ${
                !cell.inMonth
                  ? 'border-transparent'
                  : cell.date === selectedDate
                  ? 'border-accent bg-accent-soft'
                  : 'border-surface-shell hover:bg-surface-muted'
              }`}
            >
              {cell.inMonth && (
                <>
                  <span className="font-medium text-ink">{cell.day}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <CalendarEventPill key={event.id} event={event} onSelect={(id) => dispatch(selectEvent(id))} />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="block text-[10px] text-ink-soft">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
