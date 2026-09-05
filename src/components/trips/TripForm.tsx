'use client';

import { FormEvent, useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Trip, TripStatus } from '@/types';
import { useAppSelector } from '@/store/hooks';

export interface TripFormValues {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  time: string;
  description: string;
  budget: string;
  status: TripStatus;
}

interface TripFormProps {
  initialValues?: Trip;
  onSubmit: (values: Omit<Trip, 'id'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const STATUS_OPTIONS: { label: string; value: TripStatus }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

export default function TripForm({ initialValues, onSubmit, onCancel, submitLabel = 'Create Trip' }: TripFormProps) {
  const { user } = useAppSelector((s) => s.auth);
  const [values, setValues] = useState<TripFormValues>({
    name: initialValues?.name ?? '',
    destination: initialValues?.destination ?? '',
    startDate: initialValues?.startDate ?? '',
    endDate: initialValues?.endDate ?? '',
    time: initialValues?.time ?? '11:00 AM',
    description: initialValues?.description ?? '',
    budget: initialValues?.budget?.toString() ?? '',
    status: initialValues?.status ?? 'upcoming'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TripFormValues, string>>>({});

  const update = <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Trip name is required';
    if (!values.destination.trim()) next.destination = 'Destination is required';
    if (!values.startDate) next.startDate = 'Start date is required';
    if (!values.endDate) next.endDate = 'End date is required';
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      next.endDate = 'End date must be after the start date';
    }
    if (values.budget && Number.isNaN(Number(values.budget))) next.budget = 'Budget must be a number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      destination: values.destination.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      time: values.time,
      description: values.description.trim(),
      budget: Number(values.budget) || 0,
      status: values.status,
      participants: initialValues?.participants ?? [],
      imageUrl:
        initialValues?.imageUrl ??
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=700&fit=crop',
      mapLat: initialValues?.mapLat ?? 0,
      mapLng: initialValues?.mapLng ?? 0
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        id="trip-name"
        label="Trip name"
        value={values.name}
        onChange={(e) => update('name', e.target.value)}
        error={errors.name}
      />
      <Input
        id="trip-destination"
        label="Destination"
        value={values.destination}
        onChange={(e) => update('destination', e.target.value)}
        error={errors.destination}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="trip-start"
          type="date"
          label="Start date"
          value={values.startDate}
          onChange={(e) => update('startDate', e.target.value)}
          error={errors.startDate}
        />
        <Input
          id="trip-end"
          type="date"
          label="End date"
          value={values.endDate}
          onChange={(e) => update('endDate', e.target.value)}
          error={errors.endDate}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="trip-time"
          label="Time"
          value={values.time}
          onChange={(e) => update('time', e.target.value)}
        />
        <Input
          id="trip-budget"
          label="Budget (USD)"
          inputMode="numeric"
          value={values.budget}
          onChange={(e) => update('budget', e.target.value)}
          error={errors.budget}
        />
      </div>
      <Textarea
        id="trip-description"
        label="Description"
        value={values.description}
        onChange={(e) => update('description', e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Status</span>
        <Dropdown options={STATUS_OPTIONS} value={values.status} onChange={(v) => update('status', v)} />
      </div>
      <p className="text-xs text-ink-soft">Organizer: {user?.name ?? 'You'}</p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
