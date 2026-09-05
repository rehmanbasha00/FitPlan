'use client';

import Link from 'next/link';

export default function FeatureCards() {
  return (
    <section className="mt-4 grid grid-cols-1 gap-3" aria-label="Personal travel tools">
      <Link
        href="/journey"
        className="group relative min-h-[108px] overflow-hidden rounded-3xl bg-white px-5 py-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card sm:min-h-[116px] sm:px-6"
      >
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-70" aria-hidden="true">
          <svg viewBox="0 0 520 150" className="h-full w-full" preserveAspectRatio="none">
            <path d="M520 22 C430 22 430 122 335 122 S250 22 165 22 S80 122 0 122" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" className="text-accent/25" />
            <circle cx="335" cy="122" r="6" className="fill-accent/60" />
            <circle cx="165" cy="22" r="6" className="fill-accent/60" />
          </svg>
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/10 text-lg">🧭</span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Your story</p>
          </div>
          <h2 className="mt-2 text-lg font-extrabold text-ink sm:text-xl">Journey Memories</h2>
          <p className="mt-0.5 text-xs text-ink-soft">Follow your years, save every trip, photo and thought.</p>
        </div>
        <span className="absolute bottom-4 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-lg transition group-hover:translate-x-1">→</span>
      </Link>

      <Link
        href="/wallet"
        className="group relative min-h-[108px] overflow-hidden rounded-3xl bg-ink px-5 py-4 text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card sm:min-h-[116px] sm:px-6"
      >
        <div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute right-7 top-1 text-7xl font-black text-white/[0.04]" aria-hidden="true">₹</div>
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-lg">💰</span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Plan ahead</p>
          </div>
          <h2 className="mt-2 text-lg font-extrabold sm:text-xl">Trip Wallet</h2>
          <p className="mt-0.5 text-xs text-white/60">Save toward your planned trips and track what is left.</p>
        </div>
        <span className="absolute bottom-4 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition group-hover:translate-x-1">→</span>
      </Link>
    </section>
  );
}
