'use client';

import { useEffect, useState } from 'react';
import { AuthUser, Conversation, Trip } from '@/types';

export default function GroupCreator({ onCreated }: { onCreated: (conversation: Conversation) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripId, setTripId] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch('/api/trips', { cache: 'no-store' }).then((res) => res.ok ? res.json() : []).then((data) => setTrips(data as Trip[])).catch(() => setTrips([]));
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) { setUsers([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`, { signal: controller.signal, cache: 'no-store' });
        if (res.ok) setUsers(await res.json());
      } catch {}
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query]);

  const create = async () => {
    setError('');
    if (!name.trim() || selected.length < 1) { setError('Group name and at least one member are required.'); return; }
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupName: name, memberIds: selected, tripId: tripId || undefined }) });
    const data = await res.json();
    if (!res.ok) { setError(data.message ?? 'Could not create group'); return; }
    onCreated(data); setOpen(false); setName(''); setQuery(''); setSelected([]); setTripId('');
  };

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mb-2 w-full rounded-2xl border border-dashed border-surface-shell px-3 py-2 text-xs font-semibold text-ink hover:bg-surface-muted">＋ Create trip group</button>;

  return <div className="mb-2 rounded-2xl border border-surface-shell bg-white p-3 shadow-soft">
    <div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold text-ink">Create trip group</p><button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft">✕</button></div>
    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="mb-2 w-full rounded-xl bg-surface-muted px-3 py-2 text-xs" />
    {trips.length > 0 && <select value={tripId} onChange={(e) => setTripId(e.target.value)} className="mb-2 w-full rounded-xl bg-surface-muted px-3 py-2 text-xs"><option value="">Attach a trip (optional)</option>{trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.name} · {trip.destination}</option>)}</select>}
    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find by username or phone" className="w-full rounded-xl bg-surface-muted px-3 py-2 text-xs" />
    {users.length > 0 && <div className="mt-1 max-h-32 overflow-y-auto rounded-xl border border-surface-shell p-1">{users.map((u) => <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs hover:bg-surface-muted"><input type="checkbox" checked={selected.includes(u.id)} onChange={(e) => setSelected((ids) => e.target.checked ? [...ids, u.id] : ids.filter((id) => id !== u.id))} /><span className="min-w-0 flex-1 truncate"><strong>{u.name}</strong><span className="ml-1 text-ink-soft">@{u.username || u.phone}</span></span></label>)}</div>}
    {selected.length > 0 && <p className="mt-2 text-[11px] text-ink-soft">{selected.length} member{selected.length > 1 ? 's' : ''} selected</p>}
    {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
    <button type="button" onClick={create} className="mt-2 w-full rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white">Create group</button>
  </div>;
}
