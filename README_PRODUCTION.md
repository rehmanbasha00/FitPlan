# Fitplan production infrastructure

## Stack
- PostgreSQL + Prisma for users, sessions, OTP challenges, conversations/groups, messages, journey memories and wallet data.
- Redis + Socket.IO Redis adapter for cross-instance realtime chat/presence.
- S3-compatible object storage for image/video uploads. AWS S3 and Cloudflare R2 are supported through the same adapter.
- Twilio SMS for production phone OTP.

## Setup
1. Copy `.env.example` to `.env` and fill `DATABASE_URL`, Redis and storage credentials.
2. Install packages with `npm install`.
3. Generate Prisma Client: `npx prisma generate`.
4. Apply schema in development: `npx prisma migrate dev --name init`.
5. For deployment use `npx prisma migrate deploy` before starting the app.
6. Start with `npm run dev` locally or `npm run build && npm start` in production.

## Storage behavior
If S3 variables are present, uploads go to cloud storage. Without them, development falls back to `public/uploads`. Do not use local filesystem uploads for horizontally scaled production deployments.

## Important
Trip/event CRUD is still backed by the existing app-level seed data. If trips/events also need cross-instance persistence, migrate those models to Prisma in the next migration.

Socket authentication currently uses the existing client userId handshake. Before exposing the socket server publicly, validate the `fitplan_session` cookie/token server-side and reject forged user IDs.

## Fitplan Wallet — sandbox implementation

Every newly registered user now gets a separate `WalletAccount` automatically. The account has a unique wallet handle and QR payload, a paise-based PostgreSQL balance, and an immutable-style transaction ledger. The wallet API never trusts the browser to mark a real payment successful.

`PAYMENTS_MODE=sandbox` enables **Simulate verified deposit** for local testing only. It does not move real money and is intentionally not a substitute for UPI/payment-provider verification.

For live money movement, connect a regulated payment/wallet provider. The provider webhook should verify its signature, provider transaction ID, amount, currency, and idempotency before the database transaction credits the wallet. Live withdrawals must also be routed through the provider; the current withdrawal endpoint deliberately returns 501 until that provider is configured.
