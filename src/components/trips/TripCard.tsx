'use client';

import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Trip } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { openEditTrip, openDeleteTrip } from '@/store/slices/uiSlice';

const STATUS_TONE: Record<Trip['status'], 'accent' | 'success' | 'neutral' | 'danger'> = {
  upcoming: 'accent',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'danger'
};

export default function TripCard({ trip, onView }: { trip: Trip; onView: (id: string) => void }) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft">
      <div className="relative h-32 w-full">
        <Image src={trip.imageUrl} alt="" fill sizes="360px" className="object-cover" />
        <Badge tone={STATUS_TONE[trip.status]} className="absolute left-3 top-3 capitalize">
          {trip.status}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <button type="button" onClick={() => onView(trip.id)} className="focus-ring text-left">
          <p className="font-semibold text-ink">{trip.name}</p>
          <p className="text-xs text-ink-soft">{trip.destination}</p>
        </button>
        <p className="text-xs text-ink-soft">
          📅 {trip.startDate} → {trip.endDate}
        </p>
        <div className="flex -space-x-2">
          {trip.participants.slice(0, 4).map((p) => (
            <Avatar key={p.id} src={p.avatarUrl} alt={p.name} size={24} />
          ))}
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <Button size="sm" variant="secondary" onClick={() => dispatch(openEditTrip(trip.id))}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => dispatch(openDeleteTrip(trip.id))}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
