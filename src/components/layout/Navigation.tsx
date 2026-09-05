'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAppDispatch } from '@/store/hooks';
import { closeMenus } from '@/store/slices/uiSlice';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/activity', label: 'Activity', icon: '⌚' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/settings', label: 'Settings', icon: '⚙️' }
];

export default function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  return (
    <nav
      aria-label="Primary"
      className={clsx(
        mobile
          ? 'flex flex-col gap-1'
          : 'hidden items-center gap-1 rounded-full bg-surface-muted p-1 lg:flex'
      )}
    >
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => dispatch(closeMenus())}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'focus-ring flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active ? 'bg-white text-accent shadow-soft' : 'text-ink-soft hover:text-ink'
            )}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
