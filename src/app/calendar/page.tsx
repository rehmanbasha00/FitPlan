'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import EventDetailsModal from '@/components/calendar/EventDetailsModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEvents } from '@/store/slices/calendarSlice';
import Skeleton from '@/components/ui/Skeleton';

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.calendar);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <CalendarHeader />
        {status === 'loading' ? <Skeleton className="h-[500px]" /> : <CalendarGrid />}
      </div>
      <EventDetailsModal />
    </DashboardLayout>
  );
}
