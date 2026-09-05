'use client';

import Modal from '@/components/ui/Modal';
import TripForm from './TripForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCreateTrip, closeEditTrip } from '@/store/slices/uiSlice';
import { createTrip, updateTrip } from '@/store/slices/tripSlice';

export default function EditTripModal() {
  const dispatch = useAppDispatch();
  const { isCreateTripOpen, editingTripId } = useAppSelector((s) => s.ui);
  const trips = useAppSelector((s) => s.trips.items);
  const editingTrip = trips.find((t) => t.id === editingTripId);

  const isOpen = isCreateTripOpen || !!editingTripId;
  const close = () => {
    dispatch(closeCreateTrip());
    dispatch(closeEditTrip());
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={editingTrip ? 'Edit trip' : 'Create trip'} widthClass="max-w-xl">
      <TripForm
        initialValues={editingTrip}
        submitLabel={editingTrip ? 'Save changes' : 'Create Trip'}
        onCancel={close}
        onSubmit={(values) => {
          if (editingTrip) {
            dispatch(updateTrip({ ...editingTrip, ...values }));
          } else {
            dispatch(createTrip(values));
          }
          close();
        }}
      />
    </Modal>
  );
}
