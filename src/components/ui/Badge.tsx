import clsx from 'clsx';
import { PropsWithChildren } from 'react';

const toneClasses = {
  neutral: 'bg-surface-muted text-ink-soft',
  accent: 'bg-accent-soft text-accent-dark',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-600'
};

interface BadgeProps {
  tone?: keyof typeof toneClasses;
  className?: string;
}

export default function Badge({ tone = 'neutral', className, children }: PropsWithChildren<BadgeProps>) {
  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
