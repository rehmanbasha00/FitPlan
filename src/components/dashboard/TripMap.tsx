'use client';

// Leaflet map with optional real-device location permission and a real road
// route from the user's current location to the trip destination.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 1px 7px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const planeIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:20px;line-height:1;transform:rotate(45deg);filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">✈️</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Interpolates points along the great-circle (shortest path on a sphere)
// between two coordinates — used for real cross-country/cross-ocean flight
// routes where there is no drivable road (e.g. India -> France).
function greatCirclePath(start: Coordinates, end: Coordinates, segments = 64): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const lat1 = toRad(start.lat), lng1 = toRad(start.lng);
  const lat2 = toRad(end.lat), lng2 = toRad(end.lng);
  const d = 2 * Math.asin(
    Math.sqrt(Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2)
  );
  if (d === 0) return [[start.lat, start.lng]];
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
    const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lng = Math.atan2(y, x);
    points.push([toDeg(lat), toDeg(lng)]);
  }
  return points;
}

function haversineKm(a: Coordinates, b: Coordinates) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function reverseGeocodeCountry(point: Coordinates): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}&zoom=3&addressdetails=1`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.address?.country ?? null;
  } catch {
    return null;
  }
}

interface TripMapProps {
  lat: number;
  lng: number;
  label: string;
  zoom?: number;
  interactive?: boolean;
  showLocationControl?: boolean;
}

type Coordinates = { lat: number; lng: number };

function MapViewport({ destination, origin, route }: { destination: Coordinates; origin: Coordinates | null; route: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 1) {
      const bounds = L.latLngBounds(route.map(([lat, lng]) => [lat, lng] as [number, number]));
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 6, animate: true });
      return;
    }
    if (origin) {
      const bounds = L.latLngBounds([[origin.lat, origin.lng], [destination.lat, destination.lng]]);
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 7, animate: true });
    }
  }, [destination, origin, route, map]);

  return null;
}

export default function TripMap({ lat, lng, label, zoom = 11, interactive = true, showLocationControl = interactive }: TripMapProps) {
  const destination = useMemo(() => ({ lat, lng }), [lat, lng]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeKind, setRouteKind] = useState<'road' | 'flight' | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'ready' | 'denied' | 'error'>('idle');
  const [originCountry, setOriginCountry] = useState<string | null>(null);
  const [destinationCountry, setDestinationCountry] = useState<string | null>(null);

  const requestLocationAndRoute = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const start = { lat: position.coords.latitude, lng: position.coords.longitude };
        setOrigin(start);

        reverseGeocodeCountry(start).then(setOriginCountry);
        reverseGeocodeCountry(destination).then(setDestinationCountry);

        const distanceKm = haversineKm(start, destination);
        try {
          // OSRM gives a real drivable route without requiring an API key.
          // It only succeeds when a road/ferry path actually connects the
          // two points, which fails for most country-to-country trips
          // separated by an ocean — that's the flight fallback below.
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
            { cache: 'no-store' }
          );
          if (!response.ok) throw new Error('Route request failed');
          const data = await response.json();
          const coordinates = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
          const roadRoute = coordinates?.map(([routeLng, routeLat]) => [routeLat, routeLng] as [number, number]) ?? [];
          // Treat an implausibly long "road" detour as no real road connection.
          if (roadRoute.length > 1 && data.routes[0].distance / 1000 < distanceKm * 2.2) {
            setRoute(roadRoute);
            setRouteKind('road');
          } else {
            setRoute(greatCirclePath(start, destination));
            setRouteKind('flight');
          }
          setLocationStatus('ready');
        } catch {
          // No drivable route (e.g. across an ocean/country border) — draw
          // a real great-circle flight path between the two countries instead.
          setRoute(greatCirclePath(start, destination));
          setRouteKind('flight');
          setLocationStatus('ready');
        }
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [destination]);

  const midpoint = route.length > 1 ? route[Math.floor(route.length / 2)] : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        className="h-full w-full"
        aria-label={`Map centered on ${label}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{label}</Popup>
        </Marker>
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={userIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={
              routeKind === 'flight'
                ? { weight: 3, opacity: 0.85, dashArray: '2 10', color: '#2563eb' }
                : { weight: 5, opacity: 0.85 }
            }
          />
        )}
        {routeKind === 'flight' && midpoint && (
          <Marker position={midpoint} icon={planeIcon} interactive={false} />
        )}
        <MapViewport destination={destination} origin={origin} route={route} />
      </MapContainer>

      {showLocationControl && (
        <div className="absolute left-3 top-3 z-[1000] max-w-[260px] space-y-2">
          <button
            type="button"
            onClick={requestLocationAndRoute}
            disabled={locationStatus === 'loading'}
            className="focus-ring rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink shadow-card disabled:opacity-60"
            aria-label="Allow location permission and show route"
          >
            {locationStatus === 'loading' ? 'Finding your location…' : locationStatus === 'ready' ? (routeKind === 'flight' ? '✈️ Flight route from my location' : '🚗 Road route from my location') : '📍 Allow location & show route'}
          </button>
          {locationStatus === 'ready' && (originCountry || destinationCountry) && (
            <p className="rounded-xl bg-white/95 px-3 py-2 text-[11px] font-semibold text-ink shadow-soft">
              {originCountry ?? 'Your location'} → {destinationCountry ?? label}
            </p>
          )}
          {locationStatus === 'denied' && (
            <p className="mt-2 rounded-xl bg-white/95 px-3 py-2 text-[11px] text-red-600 shadow-soft">
              Location permission was denied. Allow location access in your browser settings and try again.
            </p>
          )}
          {locationStatus === 'error' && (
            <p className="mt-2 rounded-xl bg-white/95 px-3 py-2 text-[11px] text-red-600 shadow-soft">
              Could not load the route. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
