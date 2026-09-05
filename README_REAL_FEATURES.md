# Fitplan - Real Chat + Journey + Trip Wallet

## Added without replacing the existing UI
- Socket.IO real-time chat layer with a custom Node/Next server.
- New-user search and one-to-one conversation creation.
- Real-time text messages, typing state and online/offline presence.
- Image/video upload and real-time media sharing.
- Browser geolocation sharing as a Google Maps link.
- Journey Memories page with yearly vertical timeline, multiple memories per year, date, place, thoughts and media.
- Trip Wallet page connected to existing planned trips, savings progress and UPI payment intent.

## Run

```bash
npm install
npm run dev
```

The app and Socket.IO server run from the same process on port 3000.

## Production note

This implementation keeps the project's original in-memory data store so existing features remain intact. For a multi-instance production deployment, replace `src/lib/serverStore.ts` with PostgreSQL/Prisma (or another shared database), move uploads to object storage, and use a shared Socket.IO adapter such as Redis. UPI payment confirmation must be connected to a payment gateway/webhook before treating a payment as financially verified.


## Phone OTP registration
Registration now requires a phone number and OTP verification. In local development, the generated OTP is shown in the registration UI so the flow can be tested without an SMS provider. For real SMS in production, configure:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_PHONE=+1xxxxxxxxxx
```

The user phone is stored as a normalized unique identifier and user search supports name, username, email, and phone number. Trip groups can be created from the Messages screen by selecting users found by username/phone and optionally attaching a planned trip.

## Gmail / email OTP registration
You can now verify a new account with **either** a phone SMS OTP or an email OTP — pick the channel on the register screen. Email OTP works with Gmail: create an [App password](https://myaccount.google.com/apppasswords) and set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your_gmail_address@gmail.com   # optional, defaults to SMTP_USER
```

Without SMTP configured, local development falls back to showing the OTP directly in the UI (same as phone). This adds a `channel` column to `OtpChallenge` — run `npm run db:migrate` (or `db:deploy` in production) after pulling.

## Profile popover cards
Clicking your own avatar in the header opens your profile card with an **Edit profile** button that goes to `/settings#profile`. Clicking another person's avatar — in the chat header or the conversations list — opens a read-only profile popover fetched from `GET /api/users/[id]`.

## Journey timeline: hover + full modal
Hovering a year on the Journey timeline shows a small preview card (thumbnail + latest memory snippet). Clicking that preview card opens a full modal listing every memory for that year with **all** photos (click a photo for a full-size lightbox) and videos, not just the first image.

## Real country-to-country map route
The trip map first asks OSRM for a real drivable route between your current location and the destination. When no road connects the two (e.g. crossing an ocean/country border), it draws a real **great-circle flight path** instead (dashed line + plane marker), and reverse-geocodes both points (via OpenStreetMap Nominatim) to label the route, e.g. "India → France".

