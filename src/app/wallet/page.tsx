'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PlannedTripWalletCard from '@/components/wallet/PlannedTripWalletCard';
import WalletAccountCard from '@/components/wallet/WalletAccountCard';
import { Trip, Wallet } from '@/types';

export default function WalletPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tripId, setTripId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/trips', { cache: 'no-store' }),
      fetch('/api/wallet', { cache: 'no-store' }),
    ])
      .then(async ([tripsResponse, walletsResponse]) => {
        if (!tripsResponse.ok) throw new Error('Unable to load planned trips.');
        const nextTrips = (await tripsResponse.json()) as Trip[];
        const nextWallets = walletsResponse.ok ? ((await walletsResponse.json()) as Wallet[]) : [];
        if (cancelled) return;
        setTrips(nextTrips);
        setWallets(nextWallets);
        setTripId(nextTrips[0]?.id ?? '');
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load wallet data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === tripId), [trips, tripId]);
  const selectedWallet = useMemo(() => wallets.find((wallet) => wallet.tripId === tripId), [wallets, tripId]);
  const goal = selectedTrip?.budget ?? 0;
  const saved = selectedWallet?.savedAmount ?? 0;
  const remaining = Math.max(0, goal - saved);
  const progress = goal ? Math.min(100, (saved / goal) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <WalletAccountCard />
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Save for the adventure</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Trip Wallet</h1>
          <p className="mt-1 text-sm text-ink-soft">Your planned-trip savings goals are separate from your Fitplan Wallet account.</p>
        </header>

        <section aria-labelledby="planned-trips-heading" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="planned-trips-heading" className="text-lg font-extrabold text-ink">Your planned trips</h2>
              <p className="mt-0.5 text-xs text-ink-soft">Trip goals are for planning only; your account wallet is shown above.</p>
            </div>
            {trips.length > 0 && <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-ink-soft shadow-soft">{trips.length} {trips.length === 1 ? 'trip' : 'trips'}</span>}
          </div>
          {loading && <div className="rounded-3xl bg-white p-6 text-sm text-ink-soft shadow-soft">Loading your planned trips…</div>}
          {!loading && error && <div className="rounded-3xl bg-white p-6 text-sm font-semibold text-red-600 shadow-soft">{error}</div>}
          {!loading && !error && trips.length === 0 && <div className="rounded-3xl bg-white p-6 text-sm text-ink-soft shadow-soft">No planned trips found. Create a trip first, then it will appear here automatically.</div>}
          {!loading && !error && trips.length > 0 && <div className="grid gap-3">{trips.map((trip) => <PlannedTripWalletCard key={trip.id} trip={trip} wallet={wallets.find((wallet) => wallet.tripId === trip.id)} selected={trip.id === tripId} onSelect={() => setTripId(trip.id)} />)}</div>}
        </section>

        {selectedTrip && (
          <section className="rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Selected trip goal</p>
                <h2 className="mt-1 text-xl font-extrabold text-ink">{selectedTrip.name}</h2>
                <p className="mt-1 text-xs text-ink-soft">{selectedTrip.destination} · Goal ₹{goal.toLocaleString('en-IN')}</p>
              </div>
              <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs font-extrabold text-ink">{Math.round(progress)}% saved</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {([['Goal', goal], ['Saved', saved], ['Still need', remaining]] as const).map(([label, value]) => <div key={label} className="rounded-2xl bg-surface-muted p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">{label}</p><p className="mt-1 text-sm font-extrabold text-ink">₹{value.toLocaleString('en-IN')}</p></div>)}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
