'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { JourneyMemory } from '@/types';

const START_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();
const WINDOW_SIZE = 9;
const STEP = 6;

// A gentle, continuous sine wave — every year node sits exactly on the curve,
// so the line always looks like one flowing ribbon instead of straight segments.
function waveY(t: number) {
  return 50 + 25 * Math.sin(t * 0.85 + 0.3);
}

function timelinePoint(index: number, count: number) {
  const usable = 84;
  const x = count > 1 ? 8 + (index * usable) / (count - 1) : 50;
  return { x, y: waveY(index) };
}

// Sample the same sine curve at a fine step so the SVG path is a smooth,
// visibly curvy ribbon rather than straight lines between nodes.
function buildSnakePath(count: number) {
  if (count < 2) return '';
  const usable = 84;
  const steps = (count - 1) * 14;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (count - 1);
    const x = 8 + (t * usable) / (count - 1);
    const y = waveY(t);
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d.trim();
}

// Small decorative "dot dot" beads scattered along the curve between the year nodes.
function buildCurveDots(count: number) {
  if (count < 2) return [] as { x: number; y: number; key: string }[];
  const usable = 84;
  const dots: { x: number; y: number; key: string }[] = [];
  const perGap = 4;
  for (let i = 0; i < count - 1; i++) {
    for (let j = 1; j <= perGap; j++) {
      const t = i + j / (perGap + 1);
      const x = 8 + (t * usable) / (count - 1);
      dots.push({ x, y: waveY(t), key: `${i}-${j}` });
    }
  }
  return dots;
}

export default function JourneyPage() {
  const [memories, setMemories] = useState<JourneyMemory[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [modalYear, setModalYear] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [timelineStart, setTimelineStart] = useState(Math.max(START_YEAR, CURRENT_YEAR - WINDOW_SIZE + 1));
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch(`/api/journey?ts=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) setMemories(await response.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Keep the timeline's present-day end automatically in sync with the real calendar year.
  // When January 1 arrives, a new year becomes available without any code/data update.
  useEffect(() => {
    setTimelineStart((current) => {
      const maxStart = Math.max(START_YEAR, CURRENT_YEAR - WINDOW_SIZE + 1);
      return Math.min(maxStart, Math.max(START_YEAR, current));
    });
  }, []);

  const years = useMemo(() => {
    const memoryYears = memories.map((memory) => memory.year);
    return Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index)
      .concat(memoryYears)
      .filter((value, index, all) => all.indexOf(value) === index)
      .sort((a, b) => a - b);
  }, [memories]);

  const visibleYears = useMemo(() => {
    return years.slice(timelineStart - START_YEAR, timelineStart - START_YEAR + WINDOW_SIZE);
  }, [timelineStart, years]);

  const canGoBack = timelineStart > START_YEAR;
  const canGoForward = timelineStart < Math.max(START_YEAR, CURRENT_YEAR - WINDOW_SIZE + 1);

  const selected = year
    ? memories.filter((memory) => memory.year === year).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const hoverMemories = hoverYear
    ? memories.filter((memory) => memory.year === hoverYear).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const modalMemories = modalYear
    ? memories.filter((memory) => memory.year === modalYear).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const moveTimeline = (direction: -1 | 1) => {
    const maxStart = Math.max(START_YEAR, CURRENT_YEAR - WINDOW_SIZE + 1);
    setTimelineStart((current) => Math.min(maxStart, Math.max(START_YEAR, current + direction * STEP)));
  };

  const jumpToYear = (value: number) => {
    const maxStart = Math.max(START_YEAR, CURRENT_YEAR - WINDOW_SIZE + 1);
    const desired = Math.min(maxStart, Math.max(START_YEAR, value - 3));
    setTimelineStart(desired);
    setYear(value);
    window.setTimeout(() => document.getElementById('year-memories')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  };

  const openYear = (value: number) => jumpToYear(value);

  const openAddForm = () => {
    if (!year) setYear(CURRENT_YEAR);
    window.setTimeout(() => document.getElementById('memory-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const save = async () => {
    if (!date || !thoughts.trim()) return;
    if (year && Number(date.slice(0, 4)) !== year) return;
    setSaving(true);
    const images: string[] = [];
    const videos: string[] = [];

    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/messages/upload', { method: 'POST', body: form });
      if (response.ok) {
        const uploaded = await response.json();
        if (uploaded.kind === 'image') images.push(uploaded.url);
        if (uploaded.kind === 'video') videos.push(uploaded.url);
      }
    }

    const response = await fetch('/api/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, place, thoughts, images, videos })
    });

    if (response.ok) {
      setDate('');
      setPlace('');
      setThoughts('');
      setFiles([]);
      const saved = await response.json() as JourneyMemory;
      // Always re-pull the full list from the server after a save, instead of
      // patching local state — this guarantees every year's memories (2019,
      // 2023, or any other) stay visible side by side and nothing gets
      // clobbered by a stale in-memory copy.
      await load();
      jumpToYear(saved.year);
    } else {
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Your story</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Journey Memories</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">A visual timeline for every trip, date, photo and little thought you never want to forget.</p>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-soft sm:p-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">Your timeline</p>
              <h2 className="mt-1 text-xl font-extrabold text-ink">Your life, year by year</h2>
              <p className="mt-1 text-xs text-ink-soft">1990 → {CURRENT_YEAR} · automatically extends every new year</p>
            </div>
            <button onClick={openAddForm} className="hidden rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm sm:inline-flex">
              + Add memory
            </button>
          </div>

          <div className="rounded-[1.75rem] bg-gradient-to-br from-surface-muted via-white to-accent/[0.05] p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                aria-label="Previous years"
                onClick={() => moveTimeline(-1)}
                disabled={!canGoBack}
                className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-shell bg-white text-lg font-black text-ink shadow-sm transition hover:-translate-x-0.5 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                ←
              </button>
              <div className="text-center">
                <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-accent">Memory curve · live</span>
                <span className="text-sm font-extrabold text-ink">{visibleYears[0]} — {visibleYears[visibleYears.length - 1]}</span>
              </div>
              <button
                type="button"
                aria-label="Next years"
                onClick={() => moveTimeline(1)}
                disabled={!canGoForward}
                className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-shell bg-white text-lg font-black text-ink shadow-sm transition hover:translate-x-0.5 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                →
              </button>
            </div>

            <div className="relative h-[300px] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/70 sm:h-[330px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,69,0.12),transparent_38%)]" />
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="memoryCurve" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="50%" stopColor="currentColor" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
                  </linearGradient>
                  <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.1" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <path d={buildSnakePath(visibleYears.length)} fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent/25" filter="url(#curveGlow)" />
                <path d={buildSnakePath(visibleYears.length)} fill="none" stroke="url(#memoryCurve)" strokeWidth="0.9" strokeLinecap="round" className="text-accent" />
                {buildCurveDots(visibleYears.length).map((dot) => (
                  <circle key={dot.key} cx={dot.x} cy={dot.y} r="0.55" className="fill-accent/40" />
                ))}
              </svg>

              {visibleYears.map((value, index) => {
                const count = memories.filter((memory) => memory.year === value).length;
                const active = value === year;
                const point = timelinePoint(index, visibleYears.length);
                const isHovered = hoverYear === value;
                return (
                  <div
                    key={value}
                    className="absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center sm:w-32"
                    style={{ left: `${point.x}%`, top: `${point.y}%`, zIndex: isHovered ? 30 : undefined }}
                    onMouseEnter={() => setHoverYear(value)}
                    onMouseLeave={() => setHoverYear((current) => (current === value ? null : current))}
                  >
                    <button
                      type="button"
                      onClick={() => openYear(value)}
                      onFocus={() => setHoverYear(value)}
                      onBlur={() => setHoverYear((current) => (current === value ? null : current))}
                      className="group w-full text-center"
                      aria-label={`Open memories for ${value}`}
                    >
                      <span className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[4px] bg-white text-[11px] font-black shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-[68px] sm:w-[68px] sm:text-sm ${active ? 'scale-110 border-accent text-accent shadow-lg ring-8 ring-accent/10' : count ? 'border-accent/45 text-ink' : 'border-surface-shell text-ink group-hover:border-accent/60'}`}>
                        {value}
                        {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">{count}</span>}
                      </span>
                      <span className={`mt-2 block text-[10px] font-extrabold sm:text-xs ${active ? 'text-accent' : 'text-ink'}`}>
                        {count ? `${count} ${count === 1 ? 'memory' : 'memories'}` : 'No memory yet'}
                      </span>
                    </button>

                    {isHovered && count > 0 && (
                      <button
                        type="button"
                        onClick={() => setModalYear(value)}
                        className="focus-ring absolute left-1/2 top-[calc(100%+6px)] z-30 w-52 -translate-x-1/2 rounded-2xl border border-surface-shell bg-white p-3 text-left shadow-card transition hover:border-accent/40"
                        aria-label={`View all ${value} photos and memories`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-ink">{value}</span>
                          <span className="text-[10px] font-bold text-accent">View all →</span>
                        </div>
                        {hoverMemories[0]?.images[0] ? (
                          <img src={hoverMemories[0].images[0]} alt="" className="mt-2 h-20 w-full rounded-xl object-cover" />
                        ) : (
                          <div className="mt-2 flex h-20 w-full items-center justify-center rounded-xl bg-surface-muted text-2xl">🧭</div>
                        )}
                        <p className="mt-2 truncate text-[11px] font-semibold text-ink">{hoverMemories[0]?.place || 'My journey'}</p>
                        <p className="line-clamp-2 text-[10px] leading-4 text-ink-soft">{hoverMemories[0]?.thoughts}</p>
                        <p className="mt-1 text-[10px] font-bold text-ink-soft">{count} {count === 1 ? 'memory' : 'memories'} · click to open</p>
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-surface-shell bg-white/85 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-soft backdrop-blur sm:text-[10px]">
                {timelineStart === START_YEAR ? 'Start of timeline' : 'Keep exploring'}
                {canGoForward ? ' · More years →' : ` · Present day · ${CURRENT_YEAR}`}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Each arrow moves the snake curve by {STEP} years</span>
            </div>
          </div>

          <button type="button" onClick={openAddForm} className="group relative mx-auto mt-5 flex w-full max-w-[240px] flex-col items-center rounded-3xl border-2 border-dashed border-accent/30 bg-accent/[0.04] p-4 text-center transition hover:border-accent hover:bg-accent/[0.07]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl font-light text-white shadow-card">+</span>
            <span className="mt-2 text-sm font-extrabold text-ink">Add a new memory</span>
            <span className="mt-0.5 text-xs text-ink-soft">Continue your journey</span>
          </button>
        </section>

        {year !== null && (
          <section id="year-memories" className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Selected year</p>
                <h2 className="mt-1 text-2xl font-extrabold text-ink">{year} memories</h2>
                <p className="mt-1 text-sm text-ink-soft">Add as many trips and dates as you want.</p>
              </div>
              <button onClick={openAddForm} className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white">+ Add to {year}</button>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="h-36 animate-pulse rounded-3xl bg-surface-muted" />
              ) : selected.length === 0 ? (
                <button onClick={openAddForm} className="w-full rounded-3xl border-2 border-dashed border-surface-shell bg-surface-muted p-8 text-center transition hover:border-accent/30">
                  <span className="text-3xl">📸</span>
                  <p className="mt-2 text-sm font-bold text-ink">No memory saved for {year} yet</p>
                  <p className="mt-1 text-xs text-ink-soft">Click here and add your first trip.</p>
                </button>
              ) : (
                selected.map((memory) => (
                  <article key={memory.id} className="overflow-hidden rounded-[1.75rem] border border-surface-shell bg-surface-muted">
                    <div className="grid md:grid-cols-[220px_1fr]">
                      <div className="relative min-h-[180px] bg-ink/5">
                        {memory.images[0] ? (
                          <img src={memory.images[0]} alt={memory.place || 'Journey memory'} className="h-full min-h-[180px] w-full object-cover" />
                        ) : (
                          <div className="flex h-full min-h-[180px] items-center justify-center text-4xl">🧭</div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-ink shadow-sm">{memory.date}</span>
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Trip memory</p>
                            <h3 className="mt-1 text-lg font-extrabold text-ink">{memory.place || 'My journey'}</h3>
                          </div>
                          {memory.videos.length > 0 && <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white">🎥 {memory.videos.length} video</span>}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-ink-soft">{memory.thoughts}</p>
                        {memory.images.length > 1 && <p className="mt-4 text-xs font-semibold text-ink-soft">📸 +{memory.images.length - 1} more photos</p>}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {year !== null && (
          <section id="memory-form" className="scroll-mt-6 rounded-[2rem] bg-white p-5 shadow-soft sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-xl">✨</span>
              <div>
                <h2 className="text-xl font-extrabold text-ink">Add a {year} memory</h2>
                <p className="mt-1 text-sm text-ink-soft">Each save creates a separate memory, so the same year can contain unlimited trips.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-ink-soft">Date<input type="date" min={`${year}-01-01`} max={`${year}-12-31`} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2" /></label>
              <label className="text-xs font-bold text-ink-soft">Place / trip name<input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Manali, Goa, Coorg…" className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-2" /></label>
            </div>
            <label className="mt-3 block text-xs font-bold text-ink-soft">Your thoughts<textarea value={thoughts} onChange={(event) => setThoughts(event.target.value)} placeholder="What happened? What made this trip special?" className="mt-1.5 min-h-32 w-full resize-y rounded-2xl bg-surface-muted p-4 text-sm outline-none ring-accent/20 focus:ring-2" /></label>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-surface-shell bg-surface-muted p-7 text-center transition hover:border-accent/40">
              <span className="text-3xl">📸</span>
              <span className="mt-2 text-sm font-bold text-ink">Add photos or videos</span>
              <span className="mt-1 text-xs text-ink-soft">Select multiple files for this memory</span>
              <input type="file" multiple accept="image/*,video/*" hidden onChange={(event) => setFiles(Array.from(event.target.files || []))} />
            </label>
            {files.length > 0 && <p className="mt-2 text-xs font-semibold text-ink-soft">{files.length} file(s) ready to upload</p>}
            <button disabled={saving || !date || !thoughts.trim()} onClick={save} className="mt-4 w-full rounded-2xl bg-accent py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Saving your memory…' : `Save ${year} memory`}
            </button>
          </section>
        )}
      </div>

      <Modal isOpen={modalYear !== null} onClose={() => setModalYear(null)} title={modalYear ? `${modalYear} — photos & memories` : 'Memories'} widthClass="max-w-2xl">
        <div className="space-y-5">
          {modalMemories.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">No memory saved for this year yet.</p>
          ) : (
            modalMemories.map((memory) => (
              <article key={memory.id} className="rounded-[1.5rem] border border-surface-shell bg-surface-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">{memory.date}</p>
                    <h3 className="mt-0.5 text-base font-extrabold text-ink">{memory.place || 'My journey'}</h3>
                  </div>
                  {memory.videos.length > 0 && <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white">🎥 {memory.videos.length} video</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{memory.thoughts}</p>
                {memory.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {memory.images.map((src, i) => (
                      <button key={i} type="button" onClick={() => setLightbox(src)} className="focus-ring overflow-hidden rounded-xl">
                        <img src={src} alt={`${memory.place || 'Memory'} photo ${i + 1}`} className="h-20 w-full object-cover transition hover:scale-105" />
                      </button>
                    ))}
                  </div>
                )}
                {memory.videos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {memory.videos.map((src, i) => (
                      <video key={i} src={src} controls className="h-32 w-full rounded-xl bg-black object-cover" />
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </Modal>

      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label="Photo preview" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size memory" className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
          <button type="button" onClick={() => setLightbox(null)} aria-label="Close photo preview" className="focus-ring absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink">✕</button>
        </div>
      )}
    </DashboardLayout>
  );
}
