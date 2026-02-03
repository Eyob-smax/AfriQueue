# ArifQueue — Smart Healthcare for Africa

**Skip the Queue, Get Care Faster.**

ArifQueue is a digital queue management and healthcare platform that helps patients skip long waits and helps clinics run more smoothly across multiple African countries.

---

## Table of contents

- [Business perspective](#business-perspective)
- [Technical perspective](#technical-perspective)
- [Getting started](#getting-started)
- [Environment & configuration](#environment--configuration)
- [Scripts](#scripts)

---

## Business perspective

### Value proposition

- **For patients:** Less time in physical queues; real-time visibility of your position and wait; better clinic discovery by location and estimated wait; pre-visit AI symptom guidance; one place for appointments, messages, and notifications.
- **For clinics:** A clear, live queue; fewer no-shows and smoother flow; simple metrics (wait times, volume, peak hours); direct messaging with patients.
- **For the platform:** Controlled growth through approved staff and centers; full audit trail; regional focus (countries and cities) for scaling.

### Target audience

Patients and health facilities in **Ethiopia, Kenya, Nigeria, Ghana, South Africa, Tanzania, and Uganda.** Registration uses country-specific phone codes; “clinics near you” and the map are scoped to the user’s chosen country and city.

### Who uses the app

| Role | Responsibility |
|------|----------------|
| **Patients (Clients)** | Find clinics, join queues, get AI symptom guidance, manage appointments and messages. |
| **Clinic staff (Staff)** | Run live queues, advance or cancel reservations, view clinic insights, and message patients. |
| **Platform administrators (Admin)** | Approve clinics and staff, manage health centers and user accounts, view reports and audit trail. |

### Features by role

**Patients (Clients)**  
Registration (email, phone OTP, or Google) with country and city; optional health profile. Discover clinics on a map by location; join and track queues with real-time updates; AI symptom checker for triage and education; appointments and history; in-app messaging and notifications.

**Clinic staff (Staff)**  
Live queue board with advance/cancel; create and manage queues by service and date; clinic insights (average wait, patients seen, peak hours); direct chat with patients; health center settings; placeholder for schedule management.

**Administrators (Admin)**  
Dashboard with key counts and quick links; approve or reject staff registrations (with email notification); create and manage health centers (country, city, address, status); manage staff and client accounts; reports by health center and queue; audit log of admin actions; internal chat.

### Geography and localization

**Supported countries:** Ethiopia, Kenya, Nigeria, Ghana, South Africa, Tanzania, Uganda.

**Cities (examples):** Addis Ababa, Dire Dawa, Mekelle; Nairobi, Mombasa, Kisumu, Nakuru; Lagos, Abuja, Kano, Ibadan; Accra, Kumasi, Tamale; Johannesburg, Cape Town, Durban; Dar es Salaam, Dodoma, Mwanza; Kampala, Entebbe, Gulu.

Health centers are created with the same country and city options so clients only see queues for their location.

---

## Technical perspective

### Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, Leaflet (maps).
- **Backend:** Next.js server actions and API routes; standalone Socket.IO server for real-time events.
- **Database:** PostgreSQL (e.g. Neon) with Drizzle ORM; migrations via Drizzle Kit.
- **Auth:** Better Auth (email/password, Google OAuth, Twilio phone OTP); separate admin session (DB-backed).
- **Real-time:** Socket.IO (client + server); server actions call the socket server over HTTP to broadcast queue and chat events.
- **AI:** Groq SDK for the symptom-checker health assistant (triage and guidance only).
- **Email:** Nodemailer (SMTP) for verification and notifications.

### Architecture overview

- **Next.js app** (port 3000): App Router, server actions, API route for Better Auth (`/api/auth/[...all]`), middleware for auth and redirects.
- **Socket server** (port 3001): Separate Node process (`npm run socket`); handles `queue:subscribe`, `chat:join`, and an HTTP `/emit` endpoint used by server actions to broadcast to rooms (e.g. `conversation:*`, `queue:*`). Clients connect with a JWT from Better Auth.
- **Database:** Drizzle schema for users, sessions, health centers, queues, reservations, conversations, messages, notifications, audit log, etc. Better Auth tables live in the same DB.

### Key directories

- `app/` — Routes: auth (login, register, callback), dashboard (client, staff, admin), onboarding, symptom-checker, API.
- `components/` — UI: dashboard (admin, staff, client), auth, onboarding, layout, shared `ui/`.
- `lib/` — Actions (auth, admin, queue, chat, notifications, symptom-checker), auth config, DB client, socket client and server-side emit, locations constants.
- `server/` — Socket.IO server entry.
- `drizzle/` — Schema and migrations.

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL (e.g. [Neon](https://neon.tech))
- (Optional) Twilio account for phone OTP; Google Cloud project for OAuth

### Install and run

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, secrets, and optional Twilio/Google/Groq keys.
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For **real-time** queue and chat updates, run the Socket server in a second terminal:

```bash
npm run socket
```

The app defaults to `http://localhost:3001` for the socket server; set `NEXT_PUBLIC_WS_URL` and `SOCKET_PORT` if you use different URLs or ports.

### First-time setup

- **Admin user:** Create an admin in the `users` table (role `ADMIN` or `SUPER_ADMIN`, status `ACTIVE`) and set a password hash, then use the “Sign in as admin” link on the login page with your admin session credentials. You can use `npm run db:seed-admin` if you have a seed script that creates an admin.
- **Health centers:** Log in as admin, go to Health Centers, and create centers with country and city (same options as client registration) so clients in that location see queues.

---

## Environment & configuration

Copy `.env.example` to `.env` and configure:

### Required

- **Database:** `DATABASE_URL` — Postgres connection string (Neon or any Postgres).
- **Better Auth:** `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL` (e.g. `http://localhost:3000`).
- **Admin session:** `ADMIN_SESSION_SECRET` — long random string for signing admin cookies.

### Auth (optional but recommended)

- **Google OAuth:** `BETTER_AUTH_GOOGLE_CLIENT_ID`, `BETTER_AUTH_GOOGLE_CLIENT_SECRET`.  
  In Google Cloud Console, add redirect URI: `https://<your-domain>/api/auth/callback/google` (and `http://localhost:3000/...` for local).
- **Twilio (phone OTP):** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

### Real-time

- **Socket server:** `NEXT_PUBLIC_WS_URL` (e.g. `http://localhost:3001`), `SOCKET_PORT` (e.g. `3001`), `SOCKET_EMIT_SECRET` (must match the secret used by the Next app when calling the socket server’s `/emit` endpoint).

### Optional

- **Email (SMTP):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NEXT_PUBLIC_APP_URL` — for verification and notifications.
- **Groq (symptom checker):** `GROQ_API_KEY`, `AI_MODEL` (e.g. `qwen/qwen3-32b`).

See [.env.example](.env.example) for the full list.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000). |
| `npm run build` | Build for production. |
| `npm run start` | Start production server. |
| `npm run socket` | Start Socket.IO server (port 3001). Run alongside `dev` for real-time features. |
| `npm run db:generate` | Generate Drizzle migrations from schema changes. |
| `npm run db:migrate` | Run pending migrations. |
| `npm run db:push` | Push schema to DB (dev). |
| `npm run db:studio` | Open Drizzle Studio. |
| `npm run db:seed` | Seed database (if configured). |
| `npm run db:seed-admin` | Seed admin user (if configured). |
| `npm run lint` | Run ESLint. |

---

## Deploy

Build and run in production with a Postgres database and, if you need real-time features, a separate process or service running the Socket server. Set all production env vars (including `BETTER_AUTH_URL` and `NEXT_PUBLIC_WS_URL` to your production origin and socket URL). You can deploy the Next app to Vercel, Railway, or any Node host; run the socket server on a separate Node process or container.

---

*For product and feature details, see [project.md](project.md).*
