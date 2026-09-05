'use client';

import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Trip } from '@/types';
import TripMap from '@/components/dashboard/TripMapLoader';

export default function TripDetails({ trip, onClose }: { trip: Trip | null; onClose: () => void }) {
  return (
    <Modal isOpen={!!trip} onClose={onClose} title={trip?.name ?? 'Trip details'} widthClass="max-w-xl">
      {trip && (
        <div className="space-y-4">
          <div className="relative h-48 w-full overflow-hidden rounded-2xl">
            <Image src={trip.imageUrl} alt="" fill sizes="600px" className="object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <Badge tone="accent" className="capitalize">
              {trip.status}
            </Badge>
            <span>📍 {trip.destination}</span>
            <span>📅 {trip.startDate} → {trip.endDate}</span>
            <span>🕐 {trip.time}</span>
            <span>💰 ${trip.budget.toLocaleString()}</span>
          </div>
          <p className="text-sm text-ink">{trip.description || 'No description added yet.'}</p>
          {(trip.mapLat !== 0 || trip.mapLng !== 0) && (
            <div className="h-48 w-full overflow-hidden rounded-2xl">
              <TripMap lat={trip.mapLat} lng={trip.mapLng} label={trip.destination} zoom={10} interactive={false} />
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Participants</p>
            <div className="flex flex-wrap gap-3">
              {trip.participants.length === 0 && <span className="text-sm text-ink-soft">No participants yet.</span>}
              {trip.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar src={p.avatarUrl} alt={p.name} size={28} />
                  <span className="text-sm text-ink">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
