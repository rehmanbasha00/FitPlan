'use client';

import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/Skeleton';

// Leaflet touches `window` at import time, so the map must be loaded
// client-side only — this dynamic import disables server-side rendering
// for it and shows a skeleton while the map JS loads.
const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />
});

export default TripMap;
