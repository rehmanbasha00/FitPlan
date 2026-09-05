# fitplan — Trip Management Dashboard

A Next.js (App Router) + TypeScript + Tailwind CSS + Redux Toolkit trip-planning
dashboard, recreating the uploaded "fitplan" screenshots: hero trip card with a
real interactive map, weekly schedule grid, greeting panel, a working two-way
chat, and full authentication — plus complete Trip CRUD backed by Next.js
Route Handlers.

## ⚠️ Important — read before running

This project was generated in a sandbox **without internet/network access**, so
`npm install`, `npm run build`, `npm run lint` and `npm run test` were **not able
to run or be verified here**. The code follows correct Next.js 14 / Redux Toolkit
/ Vitest / react-leaflet patterns throughout, but treat it as a strong first
draft: run the commands below locally and fix anything your exact dependency
versions surface (normal for any hand-written Next.js project).

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
```

You'll land on `/login` — there's no seeded demo account, so click **Create
one** to register first (name, email, password — 6+ characters). That signs
you in automatically.

Other scripts:

```bash
npm run build    # production build
npm run lint      # ESLint (next/core-web-vitals)
npm run test      # Vitest + React Testing Library
```

## What's implemented

- **Auth**: `/register` and `/login` pages, backed by `/api/auth/*` route
  handlers. Passwords are salted + hashed with Node's `crypto.scrypt` (no
  plaintext storage) and sessions are random UUIDs mapped to users in the
  in-memory store, set as an `httpOnly` cookie. `middleware.ts` redirects
  unauthenticated requests to `/login` for every dashboard route. **Note:**
  middleware runs on the Edge runtime, which can't use Node's `crypto` — so
  middleware only checks that the session cookie is *present*; the session
  itself is verified against the store in Node route handlers (`/api/auth/me`)
  and client-side in `DashboardLayout`. This is a reasonable trade-off for a
  demo/mock-auth app, not a production security model — swap in signed JWTs
  or a real database + `next-auth` for that.
- **Real map**: `TripMap.tsx` uses `react-leaflet` + OpenStreetMap tiles (no
  API key needed) — a real, pannable/zoomable interactive map, not a static
  image. It's loaded via `next/dynamic({ ssr:false })` since Leaflet needs
  `window`. Used in the hero card (mini preview + expandable full map modal)
  and in trip details.
- **Real two-way chat**: sending a message now triggers a simulated reply
  from the other participant after a short "typing…" delay
  (`simulateReply` thunk in `messageSlice`), so conversations actually go
  back and forth. To be upfront about scope: this is a single-user demo, so
  the "other side" is a canned-reply simulator, not a second live human or a
  WebSocket server — that would need real backend infrastructure. Layout bug
  from the previous version is also fixed: the conversation list previously
  had `overflow-y-auto` with no bounded height, so it grew past its container
  instead of scrolling — both the list and the chat pane now correctly fill
  and scroll within their parent, on both `/` and `/messages`.
- **Pages**: `/login`, `/register`, `/` (dashboard), `/calendar`, `/trips`,
  `/activity`, `/messages`, `/settings` — all except auth pages are
  middleware-protected.
- **Redux Toolkit**: `tripSlice`, `calendarSlice`, `messageSlice`, `uiSlice`,
  `authSlice` — typed hooks, `createAsyncThunk` for all server calls.
- **API routes** (`src/app/api/**`): full CRUD for trips, events and
  messages, plus auth, backed by an in-memory store (`src/lib/serverStore.ts`)
  seeded from `src/data/mockData.ts`. Data resets on server restart — swap
  `serverStore.ts` for a real DB when you're ready.
- **Trip management**: create / edit / delete / view, search, status filter,
  and sort by date/name/status, all wired through Redux + the API routes
  (`/trips`; also linked from "Manage all trips" on the dashboard).
- **Calendar**: month navigation, date & event selection, calendar/list
  toggle, a full month grid on `/calendar`, and a 5-day schedule strip on the
  dashboard.
- **Loading / error / empty states** on trips and schedule.
- **Accessibility**: semantic landmarks, labelled inputs, `aria-*` on menus/
  dialogs/toggles, keyboard-dismissible modals, visible focus rings.
- **Tests** (`src/tests/**`): Redux reducer tests, `TripForm` validation,
  `ChatWindow` send flow, `ScheduleGrid` rendering, and API route tests for
  `/api/trips` and `/api/auth/*`.

## What's intentionally lighter-touch

- Only `/api/trips` and `/api/auth/*` have dedicated route-handler tests; the
  same pattern extends cleanly to `/api/events` and `/api/messages`.
- Chat "real-time" is a client-side simulated reply, not a live second user —
  see note above.
- Auth session verification in middleware is presence-only (see note above) —
  fine for a demo, not for production.
- If your Next.js version complains about the `leaflet/dist/leaflet.css`
  import living in `TripMap.tsx` instead of the root layout, move that one
  import line into `src/app/layout.tsx`.

## Project structure

```
src/
  app/                # routes, API route handlers, login/register
  components/          # layout, dashboard, trips, calendar, messages, ui
  store/                # Redux Toolkit slices (incl. authSlice) + typed hooks
  data/                 # seed data + auto-reply pool
  lib/                  # in-memory "db" + auth helpers shared by route handlers
  types/                # shared TypeScript types
  middleware.ts          # route protection
  tests/                # Vitest + RTL specs
```
