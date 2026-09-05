'use client';

import { CalendarEvent } from '@/types';

const accentDot: Record<CalendarEvent['accent'], string> = {
  blue: 'bg-sky-400',
  green: 'bg-emerald-400',
  peach: 'bg-orange-400',
  lilac: 'bg-purple-400'
};

export default function CalendarEventPill({
  event,
  onSelect
}: {
  event: CalendarEvent;
  onSelect: (id: string) => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          onSelect(event.id);
        }
      }}
      className="focus-ring flex items-center gap-1 truncate rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-ink hover:bg-surface-shell"
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accentDot[event.accent]}`} />
      <span className="truncate">{event.title}</span>
    </span>
  );
}
