'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HeroTripCard from '@/components/dashboard/HeroTripCard';
import UpcomingSchedule from '@/components/dashboard/UpcomingSchedule';
import GreetingCard from '@/components/dashboard/GreetingCard';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import EventDetailsModal from '@/components/calendar/EventDetailsModal';
import EditTripModal from '@/components/trips/EditTripModal';
import FeatureCards from '@/components/dashboard/FeatureCards';
import ChatSocketBridge from '@/components/messages/ChatSocketBridge';
import Skeleton from '@/components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTrips } from '@/store/slices/tripSlice';
import { fetchEvents } from '@/store/slices/calendarSlice';
import { fetchMessages } from '@/store/slices/messageSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: trips, status: tripsStatus } = useAppSelector((s) => s.trips);

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchEvents());
    dispatch(fetchMessages());
  }, [dispatch]);

  const heroTrip = trips[0];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          {tripsStatus === 'loading' || !heroTrip ? (
            <Skeleton className="h-[320px] w-full sm:h-[380px]" />
          ) : (
            <HeroTripCard trip={heroTrip} />
          )}
          <UpcomingSchedule />
        </div>

        <div className="flex flex-col gap-4">
          <GreetingCard />
          <section className="grid h-[330px] min-h-0 grid-cols-1 gap-0 overflow-hidden rounded-3xl bg-white shadow-soft sm:grid-cols-[180px_1fr]">
            <div className="h-full min-h-0 overflow-hidden border-b border-surface-shell sm:border-b-0 sm:border-r">
              <ConversationList />
            </div>
            <div className="h-full min-h-0 overflow-hidden">
              <ChatWindow />
            </div>
          </section>
          <FeatureCards />
        </div>
      </div>
      <ChatSocketBridge />
      <EventDetailsModal />
      <EditTripModal />
    </DashboardLayout>
  );
}
