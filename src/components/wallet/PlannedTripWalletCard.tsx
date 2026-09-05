'use client';
import Image from 'next/image';
import { Trip, Wallet } from '@/types';

interface Props { trip: Trip; wallet?: Wallet; selected: boolean; onSelect: () => void; }

function dateRange(startDate: string, endDate: string) {
  const format = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${format(startDate)} – ${format(endDate)}`;
}

export default function PlannedTripWalletCard({ trip, wallet, selected, onSelect }: Props) {
  const goal = trip.budget;
  const saved = wallet?.savedAmount ?? 0;
  const remaining = Math.max(0, goal - saved);
  const progress = goal ? Math.min(100, (saved / goal) * 100) : 0;

  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={`group w-full overflow-hidden rounded-3xl border text-left transition-all ${selected ? 'border-accent bg-white shadow-card ring-2 ring-accent/10' : 'border-transparent bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-card'}`}>
      <div className="grid min-h-[132px] grid-cols-[25%_45%_30%]">
        <div className="relative min-h-[132px] overflow-hidden">
          <Image src={trip.imageUrl} alt={trip.destination} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/25" />
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-ink sm:left-3 sm:top-3 sm:text-[10px]">Planned</span>
        </div>

        <div className="min-w-0 p-3 sm:p-4">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-accent sm:text-[11px]">{trip.destination}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-5 text-ink sm:text-base">{trip.name}</h3>
          <p className="mt-2 text-[10px] leading-4 text-ink-soft sm:text-xs">📅 {dateRange(trip.startDate, trip.endDate)}</p>
          <p className="mt-1 line-clamp-1 text-[10px] text-ink-soft sm:text-xs">📍 {trip.destination}</p>
        </div>

        <div className="flex min-w-0 flex-col justify-center border-l border-ink/5 bg-surface-muted/60 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft sm:text-[10px]">Trip goal</span>
            <span className="text-[10px] font-extrabold text-accent sm:text-xs">{Math.round(progress)}%</span>
          </div>
          <p className="mt-1 truncate text-base font-extrabold text-ink sm:text-xl">₹{goal.toLocaleString('en-IN')}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10 sm:mt-3 sm:h-2"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <div className="mt-2 space-y-0.5 text-[9px] sm:text-[10px]">
            <p className="truncate font-bold text-ink">Saved ₹{saved.toLocaleString('en-IN')}</p>
            <p className="truncate text-ink-soft">Need ₹{remaining.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
