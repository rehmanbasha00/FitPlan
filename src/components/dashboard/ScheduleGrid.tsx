'use client';

import { CalendarEvent } from '@/types';
import EventCard from './EventCard';

const HOURS = ['11 AM', '12 PM', '1 PM', '2 PM'];

interface ScheduleGridProps {
  days: { label: string; date: string; isSelected: boolean }[];
  events: CalendarEvent[];
  onSelectDate: (date: string) => void;
  onSelectEvent: (id: string) => void;
}

export default function ScheduleGrid({ days, events, onSelectDate, onSelectEvent }: ScheduleGridProps) {
  const eventsForDay = (date: string) => events.filter((e) => e.date === date);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-[60px_repeat(5,1fr)]">
        <div />
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`focus-ring border-b border-surface-shell px-2 pb-3 text-center text-sm font-medium ${
              day.isSelected ? 'text-accent' : 'text-ink-soft'
            }`}
          >
            {day.label}
            {day.isSelected && <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-accent" />}
          </button>
        ))}

        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-t border-surface-shell py-4 pr-2 text-xs text-ink-soft">{hour}</div>
            {days.map((day) => {
              const dayEvents = eventsForDay(day.date);
              const hourIndex = HOURS.indexOf(hour);
              const eventForHour = dayEvents[hourIndex];
              return (
                <div key={day.date + hour} className="min-h-[64px] border-t border-surface-shell p-1">
                  {eventForHour && (
                    <EventCard event={eventForHour} onSelect={onSelectEvent} compact={hourIndex > 0} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
