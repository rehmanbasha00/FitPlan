import DashboardLayout from '@/components/layout/DashboardLayout';
import TripList from '@/components/trips/TripList';

export default function TripsPage() {
  return (
    <DashboardLayout>
      <TripList />
    </DashboardLayout>
  );
}
