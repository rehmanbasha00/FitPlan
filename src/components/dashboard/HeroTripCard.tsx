'use client';

import Image from 'next/image';
import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { Trip } from '@/types';
import TripMap from './TripMapLoader';
import Modal from '@/components/ui/Modal';

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('en-US', opts)} - ${e.toLocaleDateString('en-US', opts)}`;
}

export default function HeroTripCard({ trip }: { trip: Trip }) {
  const [mapExpanded, setMapExpanded] = useState(false);
  const visible = trip.participants.slice(0, 3);
  const extra = trip.participants.length - visible.length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-teal-100 shadow-card">
      <div className="relative h-[320px] w-full sm:h-[380px]">
        <Image
          src={trip.imageUrl}
          alt={`Scenic view of ${trip.destination}`}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <div className="flex items-center rounded-full bg-white/95 py-1 pl-1 pr-3 shadow-soft">
            <div className="flex -space-x-2">
              {visible.map((p) => (
                <Avatar key={p.id} src={p.avatarUrl} alt={p.name} size={28} />
              ))}
            </div>
            {extra > 0 && <span className="ml-2 text-xs font-semibold text-ink">+{extra}</span>}
          </div>
          <button
            type="button"
            aria-label="Trip reminders"
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-soft"
          >
            🔔
          </button>
        </div>

        <div className="absolute bottom-4 left-4 w-[calc(100%-2rem)] max-w-xs rounded-3xl bg-white p-4 shadow-card sm:bottom-6 sm:left-6">
          <h2 className="text-lg font-bold text-ink">{trip.name}</h2>
          <p className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
            <span className="flex items-center gap-1">📅 {formatRange(trip.startDate, trip.endDate)}</span>
            <span className="flex items-center gap-1">🕐 {trip.time}</span>
          </p>

          <div className="relative mt-3 h-28 overflow-hidden rounded-2xl">
            <TripMap lat={trip.mapLat} lng={trip.mapLng} label={trip.destination} zoom={9} interactive={false} />
            <button
              type="button"
              onClick={() => setMapExpanded(true)}
              aria-label="Expand map"
              className="focus-ring absolute right-2 top-2 z-[1000] flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              ⤢
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={mapExpanded}
        onClose={() => setMapExpanded(false)}
        title={`Map · ${trip.destination}`}
        widthClass="max-w-2xl"
      >
        <div className="h-[420px] w-full overflow-hidden rounded-2xl">
          <TripMap lat={trip.mapLat} lng={trip.mapLng} label={trip.destination} zoom={6} interactive showLocationControl />
        </div>
      </Modal>
    </div>
  );
}
