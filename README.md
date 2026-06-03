# Maya's Lodge — website & booking admin

A website and booking-management system for Maya's Lodge, a family-run Irish
bed & breakfast. Guests browse rooms, check live availability and send booking
requests; the owner manages rooms, photos, availability and requests from a
private admin dashboard.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Prisma**.

---

## What's included

**Public site** (`/`)
- Home, Rooms, Room detail, About, Contact pages
- Per-room availability calendar (occupied dates are blocked)
- Booking *request* flow — no online payment; the owner confirms by email
- Fully responsive (mobile-first)

**Owner admin** (`/admin`)
- Dashboard: pending requests, upcoming arrivals, quick confirm/decline
- Bookings: filter, confirm, decline, cancel, delete
- Calendar: a month-by-month occupancy grid across all rooms; add manual
  reservations, Booking.com reservations, or block dates for maintenance
- Rooms: full CRUD, amenities (incl. private/shared bathroom), photo uploads
- Settings: edit all site text, contact details, links and currency

---

## Getting started

```bash
npm install
npm run db:migrate      # create the SQLite database
npm run db:seed         # add 6 demo rooms, amenities, settings, sample bookings
npm run dev             # http://localhost:3000
```

### Admin login

Created by the seed script from `.env`:

- URL: <http://localhost:3000/admin>
- Email: `maya@mayaslodge.ie`
- Password: `changeme123`  ← **change this** (edit `.env`, then re-seed, or
  add a real password before going live)

---

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build & run |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Wipe & re-create the database, then re-seed |
| `npm run db:studio` | Open Prisma Studio (browse/edit the DB) |
| `npm run placeholders` | Regenerate the placeholder room images |

---

## Replacing the placeholders with your real content

- **Logo:** the clover mark is drawn in code (`components/Logo.tsx`) so it
  stays crisp everywhere. To use your exact image instead, drop it at
  `public/logo.png` and swap `<CloverMark />` for an `<Image>`.
- **Room photos:** open a room in the admin (`/admin/rooms`) and upload photos.
  They replace the "Photo coming soon" placeholders. The first photo is the
  cover.
- **All site text** (welcome, about, breakfast, address, phone, links,
  Booking.com URL, map): edit in **Admin → Settings**.

---

## Notes for going live

- **Database:** dev uses SQLite (`prisma/schema.prisma`, `provider = "sqlite"`).
  For production, switch the provider to `postgresql` and set `DATABASE_URL`.
- **Secrets:** set a strong `AUTH_SECRET` (`openssl rand -hex 32`) and a real
  admin password in the host's environment.
- **Uploaded photos:** in dev they're written to `public/uploads`. On hosts
  with an ephemeral/read-only filesystem (e.g. Vercel), move uploads to object
  storage (S3, Cloudflare R2, etc.) — only `app/api/admin/upload/route.ts`
  needs to change.
- **Booking.com sync:** intentionally not built yet, but the data model is
  ready for it (`Booking.source` already supports `BOOKING_COM`, and the
  calendar treats it as blocking). Booking.com supports iCal import/export, so
  two-way sync can be added later without schema changes.
- **Multi-language:** the site is English-only today. Text is centralised
  (settings + content) so translations can be layered on later.

---

## Project structure

```
app/
  (site)/            public website (home, rooms, about, contact, booking)
  admin/             owner dashboard (login, bookings, calendar, rooms, settings)
  api/admin/upload/  image upload endpoint
components/          shared + site + admin React components
lib/                 prisma client, auth, dates, availability, formatting
prisma/              schema, migrations, seed script
public/rooms/        generated placeholder room images
```
