'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCreateTrip } from '@/store/slices/uiSlice';
import Button from '@/components/ui/Button';

const QUICK_OPTIONS = ['Now', 'Tomorrow', 'Next week', 'Custom'] as const;

export default function GreetingCard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [intent, setIntent] = useState('');
  const [selectedOption, setSelectedOption] = useState<(typeof QUICK_OPTIONS)[number] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(openCreateTrip());
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft sm:p-6">
      <h2 className="text-xl font-extrabold leading-snug text-ink sm:text-2xl">
        Have a Good day,
        <br />
        {user?.name ?? 'there'} 👋
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Fuel your days with the boundless enthusiasm of a lifelong explorer.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2">
        <label htmlFor="intent" className="sr-only">
          I want to...
        </label>
        <input
          id="intent"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="I want to..."
          className="focus-ring flex-1 bg-transparent text-sm placeholder:text-ink-soft/70"
        />
        <Button type="submit" size="icon" aria-label="Plan it">
          ➤
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelectedOption(option)}
            aria-pressed={selectedOption === option}
            className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedOption === option
                ? 'border-accent bg-accent-soft text-accent-dark'
                : 'border-surface-shell text-ink-soft hover:border-ink-soft'
            }`}
          >
            {option === 'Now' && '⚡ '}
            {option === 'Tomorrow' && '🕐 '}
            {option === 'Next week' && '📅 '}
            {option === 'Custom' && '✏️ '}
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
