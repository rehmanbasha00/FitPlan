'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from './Navigation';
import ProfileCard from './ProfileCard';
import Avatar from '@/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleNotifications, toggleProfileMenu, closeMenus } from '@/store/slices/uiSlice';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchMessages } from '@/store/slices/messageSlice';
import { fetchTrips } from '@/store/slices/tripSlice';

const TRIP_REMINDER_WINDOW_DAYS = 7;

interface AppNotification {
  id: string;
  text: string;
  kind: 'message' | 'trip';
}

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isNotificationsOpen, isProfileMenuOpen } = useAppSelector((s) => s.ui);
  const { user } = useAppSelector((s) => s.auth);
  const { conversations, status: messagesStatus } = useAppSelector((s) => s.messages);
  const { items: trips, status: tripsStatus } = useAppSelector((s) => s.trips);
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    if (messagesStatus === 'idle') dispatch(fetchMessages());
    if (tripsStatus === 'idle') dispatch(fetchTrips());
  }, [dispatch, user, messagesStatus, tripsStatus]);

  const messageNotifications: AppNotification[] = conversations
    .filter((c) => c.unreadCount > 0)
    .map((c) => ({
      id: `message-${c.id}`,
      kind: 'message',
      text:
        c.unreadCount === 1
          ? `New message from ${c.isGroup ? c.groupName ?? 'group' : c.participant.name}`
          : `${c.unreadCount} new messages from ${c.isGroup ? c.groupName ?? 'group' : c.participant.name}`
    }));

  const now = Date.now();
  const tripNotifications: AppNotification[] = trips
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .map((t) => {
      const daysUntil = Math.ceil((new Date(t.startDate).getTime() - now) / (1000 * 60 * 60 * 24));
      return { trip: t, daysUntil };
    })
    .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= TRIP_REMINDER_WINDOW_DAYS)
    .map(({ trip, daysUntil }) => ({
      id: `trip-${trip.id}`,
      kind: 'trip' as const,
      text:
        daysUntil === 0
          ? `${trip.name} starts today.`
          : daysUntil === 1
          ? `${trip.name} starts tomorrow.`
          : `${trip.name} starts in ${daysUntil} days.`
    }));

  const notifications: AppNotification[] = [...messageNotifications, ...tripNotifications];
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) dispatch(closeMenus());
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(closeMenus());
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [dispatch, isProfileMenuOpen]);

  const handleLogout = async () => {
    dispatch(closeMenus());
    await dispatch(logoutUser());
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-soft sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-extrabold text-ink">
          <span aria-hidden="true" className="text-accent">🧭</span>
          fitplan
        </Link>
        <button
          type="button"
          className="focus-ring rounded-full p-2 text-ink lg:hidden"
          aria-expanded={mobileNavOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      <Navigation />

      <div className="flex items-center gap-3">
        <label htmlFor="global-search" className="sr-only">
          Search
        </label>
        <div className="hidden items-center gap-2 rounded-full bg-surface-muted px-4 py-2 sm:flex">
          <span aria-hidden="true">🔍</span>
          <input
            id="global-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here..."
            className="focus-ring w-40 bg-transparent text-sm placeholder:text-ink-soft/70"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label={hasNotifications ? `Notifications (${notifications.length} new)` : 'Notifications'}
            aria-expanded={isNotificationsOpen}
            onClick={() => dispatch(toggleNotifications())}
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted hover:bg-surface-shell"
          >
            🔔
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            )}
          </button>
          {isNotificationsOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-surface-shell bg-white p-3 text-sm shadow-card"
            >
              <p className="font-semibold text-ink">Notifications</p>
              {hasNotifications ? (
                <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-ink-soft">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex items-start gap-2">
                      <span aria-hidden="true">{n.kind === 'message' ? '💬' : '🗓️'}</span>
                      <span>{n.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-ink-soft">You're all caught up — no new notifications.</p>
              )}
              <button className="focus-ring mt-2 text-xs font-medium text-accent" onClick={() => dispatch(closeMenus())}>
                Close
              </button>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            aria-label="Open profile"
            aria-expanded={isProfileMenuOpen}
            onClick={() => dispatch(toggleProfileMenu())}
            className="focus-ring"
          >
            {user ? (
              <Avatar src={user.avatarUrl} alt={user.name} size={40} />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-sm">
                👤
              </span>
            )}
          </button>
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-50">
              <ProfileCard />
              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring mt-2 w-full rounded-xl border border-surface-shell bg-white px-3 py-2 text-xs font-bold text-ink-soft shadow-soft hover:bg-surface-muted"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <div className="w-full lg:hidden">
          <Navigation mobile />
        </div>
      )}
    </header>
  );
}
