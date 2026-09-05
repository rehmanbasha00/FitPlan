'use client';

import Image from 'next/image';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import { CalendarEvent } from '@/types';

const accentClasses: Record<CalendarEvent['accent'], string> = {
  blue: 'bg-sky-50 border-sky-100',
  green: 'bg-emerald-50 border-emerald-100',
  peach: 'bg-orange-50 border-orange-100',
  lilac: 'bg-white border-surface-shell'
};

interface EventCardProps {
  event: CalendarEvent;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export default function EventCard({ event, onSelect, compact }: EventCardProps) {
  const visible = event.participants.slice(0, 3);
  const extra = event.participants.length - visible.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      className={clsx(
        'focus-ring group flex w-full flex-col overflow-hidden rounded-2xl border text-left shadow-soft transition-transform hover:-translate-y-0.5',
        accentClasses[event.accent]
      )}
    >
      {event.imageUrl && !compact && (
        <div className="relative h-24 w-full">
          <Image src={event.imageUrl} alt="" fill sizes="220px" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-sm font-semibold leading-snug text-ink">{event.title}</p>
        <p className="flex items-center gap-1 text-xs text-ink-soft">
          📅 {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          {!compact && <span className="ml-1">🕐 {event.time}</span>}
        </p>
        {event.participants.length > 0 && (
          <div className="mt-auto flex items-center gap-1 pt-1">
            <div className="flex -space-x-2">
              {visible.map((p) => (
                <Avatar key={p.id} src={p.avatarUrl} alt={p.name} size={20} />
              ))}
            </div>
            {extra > 0 && <span className="text-[11px] font-medium text-ink-soft">+{extra}</span>}
          </div>
        )}
      </div>
    </button>
  );
}
