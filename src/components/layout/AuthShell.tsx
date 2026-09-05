'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';

// A few evenly-spaced stops for the dotted flight-route motif. Only the
// first and last stops are highlighted (origin / destination) — everything
// else is a quiet waypoint, so the line reads as one clear journey.
const ROUTE_STOPS = [
  { x: 40, y: 108 },
  { x: 130, y: 58 },
  { x: 215, y: 118 },
  { x: 300, y: 46 },
  { x: 380, y: 92 }
];

function routePath() {
  return ROUTE_STOPS.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export default function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] max-w-[540px] overflow-hidden bg-night lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(680px_420px_at_18%_12%,rgba(255,106,69,0.18),transparent_60%)]" />
        <svg
          className="pointer-events-none absolute inset-x-10 top-1/2 h-auto w-[calc(100%-5rem)] -translate-y-1/2 opacity-80"
          viewBox="0 0 420 160"
          fill="none"
          aria-hidden="true"
        >
          <path d={routePath()} stroke="#FF6A45" strokeWidth="1.5" strokeDasharray="1 8" strokeLinecap="round" />
          {ROUTE_STOPS.map((point, index) => {
            const isEndpoint = index === 0 || index === ROUTE_STOPS.length - 1;
            return (
              <circle
                key={`${point.x}-${point.y}`}
                cx={point.x}
                cy={point.y}
                r={isEndpoint ? 4.5 : 2.5}
                fill={isEndpoint ? '#FF6A45' : '#FFFFFF'}
                fillOpacity={isEndpoint ? 1 : 0.5}
              />
            );
          })}
        </svg>

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="text-accent" aria-hidden="true">🧭</span> fitplan
          </Link>
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Trip planning, reimagined</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white">
              Every trip, mapped, saved and shared — from first idea to landing.
            </h2>
          </div>
          <p className="text-xs text-white/40">Itineraries, memories and payments — built for travelers everywhere.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-1.5 text-lg font-extrabold text-ink">
              <span className="text-accent" aria-hidden="true">🧭</span> fitplan
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">{children}</div>
        </div>
      </div>
    </div>
  );
}
