'use client';

import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectEvent } from '@/store/slices/calendarSlice';

export default function EventDetailsModal() {
  const dispatch = useAppDispatch();
  const { events, selectedEventId } = useAppSelector((s) => s.calendar);
  const event = events.find((e) => e.id === selectedEventId) ?? null;

  const close = () => dispatch(selectEvent(null));

  return (
    <Modal isOpen={!!event} onClose={close} title={event?.title ?? 'Event details'} widthClass="max-w-lg">
      {event && (
        <div className="space-y-4">
          {event.imageUrl && (
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image src={event.imageUrl} alt="" fill sizes="600px" className="object-cover" />
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-ink-soft">
            <span>📅 {event.date}</span>
            <span>🕐 {event.time}</span>
            <span>📍 {event.location}</span>
          </div>
          <p className="text-sm text-ink">{event.description}</p>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Participants</p>
            <div className="flex flex-wrap gap-3">
              {event.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar src={p.avatarUrl} alt={p.name} size={26} />
                  <span className="text-sm text-ink">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
