# Fitplan — clean setup

The ZIP intentionally does **not** include `node_modules`, `.next`, or TypeScript cache files.

## 1. Open the project folder in VS Code

Open the extracted `fitplan-trip-dashboard` folder itself.

## 2. Install dependencies once

```bash
npm install
```

Wait until it finishes with no `npm ERR!`.

## 3. Generate Prisma client

```bash
npx prisma generate
```

## 4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important

If VS Code shows hundreds of errors such as:
- `Cannot find module 'react'`
- `Cannot find module 'next/server'`
- `Cannot find name 'process'`
- JSX `IntrinsicElements` errors

those are dependency/type errors caused by `node_modules` not being installed yet. Run `npm install` first, then restart VS Code's TypeScript server if necessary.

In VS Code:
`Ctrl + Shift + P` → `TypeScript: Restart TS Server`

If the dev server takes a long time on the first start, allow the first Next.js compilation to finish. Later page loads are normally much faster.
