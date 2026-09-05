'use client';

import { useEffect, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { AuthUser } from '@/types';

export default function ParticipantProfileCard({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/users/${userId}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not-found'))))
      .then((data) => { if (!cancelled) setUser(data as AuthUser); })
      .catch(() => { if (!cancelled) setError('Could not load this profile'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div role="dialog" aria-label="User profile card" className="w-[260px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.5rem] border border-surface-shell bg-white shadow-card">
      <div className="h-14 bg-gradient-to-r from-ink via-ink to-accent/80" />
      <div className="relative px-4 pb-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile card"
          className="focus-ring absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs text-ink-soft shadow-sm hover:bg-white"
        >
          ✕
        </button>
        {loading ? (
          <div className="-mt-8 space-y-2">
            <div className="h-[60px] w-[60px] animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        ) : error || !user ? (
          <p className="-mt-4 py-6 text-center text-xs text-ink-soft">{error || 'User not found'}</p>
        ) : (
          <>
            <div className="-mt-8 flex items-end justify-between gap-2">
              <Avatar src={user.avatarUrl} alt={user.name} size={60} />
            </div>
            <h2 className="mt-2 truncate text-base font-extrabold text-ink">{user.name}</h2>
            <p className="text-sm font-medium text-accent">@{user.username || 'traveller'}</p>
            {user.bio && <p className="mt-2 text-xs leading-4 text-ink-soft">{user.bio}</p>}
            <div className="mt-3 space-y-1.5 text-[11px] text-ink-soft">
              {user.location && <p>📍 {user.location}</p>}
              {user.website && <p className="truncate">🔗 {user.website}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
