'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeDeleteTrip } from '@/store/slices/uiSlice';
import { deleteTrip } from '@/store/slices/tripSlice';

export default function DeleteTripDialog() {
  const dispatch = useAppDispatch();
  const { deletingTripId } = useAppSelector((s) => s.ui);
  const trip = useAppSelector((s) => s.trips.items.find((t) => t.id === deletingTripId));

  const close = () => dispatch(closeDeleteTrip());

  return (
    <Modal isOpen={!!deletingTripId} onClose={close} title="Delete trip" widthClass="max-w-sm">
      <p className="text-sm text-ink-soft">
        Are you sure you want to delete <span className="font-semibold text-ink">{trip?.name}</span>? This can&apos;t
        be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (deletingTripId) dispatch(deleteTrip(deletingTripId));
            close();
          }}
        >
          Delete trip
        </Button>
      </div>
    </Modal>
  );
}
