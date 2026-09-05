'use client';

import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeMenus } from '@/store/slices/uiSlice';

export default function ProfileCard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return null;

  return (
    <div role="dialog" aria-label="Profile card" className="w-[260px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.5rem] border border-surface-shell bg-white shadow-card">
      <div className="h-14 bg-gradient-to-r from-ink via-ink to-accent/80" />
      <div className="relative px-4 pb-4">
        <div className="-mt-8 flex items-end justify-between gap-2">
          <Avatar src={user.avatarUrl} alt={user.name} size={60} />
          <Link href="/settings#profile" onClick={() => dispatch(closeMenus())} className="focus-ring rounded-full bg-accent px-3 py-2 text-xs font-bold text-white hover:brightness-95">
            Edit profile
          </Link>
        </div>
        <h2 className="mt-2 truncate text-base font-extrabold text-ink">{user.name}</h2>
        <p className="text-sm font-medium text-accent">@{user.username || 'traveller'}</p>
        {user.bio && <p className="mt-2 text-xs leading-4 text-ink-soft">{user.bio}</p>}
        <div className="mt-3 space-y-1.5 text-[11px] text-ink-soft">
          {user.location && <p>📍 {user.location}</p>}
          {user.website && <p className="truncate">🔗 {user.website}</p>}
          <p>✉️ {user.email}</p>
        </div>
      </div>
    </div>
  );
}
