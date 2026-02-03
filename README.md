This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Auth (Google + Phone)

Authentication uses [Better Auth](https://www.better-auth.com/) with **Google (social)** and **phone (Twilio OTP)**. Email/password is also supported. Copy `.env.example` to `.env` and set the following.

### Environment variables

- **Better Auth (required):** `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL` (e.g. `http://localhost:3000`), `DATABASE_URL` (Postgres – required for users, sessions, verification).
- **Google:** `BETTER_AUTH_GOOGLE_CLIENT_ID`, `BETTER_AUTH_GOOGLE_CLIENT_SECRET`.
- **Twilio (phone OTP):** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (e.g. `+1234567890`).

See [.env.example](.env.example) for the full list.

### Google Cloud Console

1. Create (or use) an OAuth 2.0 Client ID (Web application).
2. Add **Authorized redirect URIs:**
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-domain>/api/auth/callback/google`
3. Set `BETTER_AUTH_GOOGLE_CLIENT_ID` and `BETTER_AUTH_GOOGLE_CLIENT_SECRET` in `.env`.

### Twilio

1. Create a [Twilio](https://www.twilio.com/) account and get Account SID and Auth Token.
2. Get a phone number that can send SMS (trial is fine for development).
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `.env`.

### Database

Run migrations so Better Auth tables exist (including `user` with `phoneNumber` / `phoneNumberVerified`):

```bash
npm run db:migrate
```

If you see DB errors (e.g. “Tenant or user not found”), check your `DATABASE_URL` and Neon/Postgres connectivity.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
