# VPN Admin Frontend

Admin dashboard for the VPN management system, built with Next.js (App
Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, and Auth.js
(NextAuth v5) with Google OAuth. This is the **control-plane UI only** — it
never carries VPN traffic; all it does is call the Go/Gin backend.

## Requirements

- Node.js 20+
- A running instance of `vpn-backend` (see `../vpn-backend/README.md`)
- A Google OAuth 2.0 Web client (Client ID + Secret)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
npm run dev
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 48
```

### Google OAuth setup

1. In Google Cloud Console, create an OAuth 2.0 **Web application** client.
2. Add an authorized redirect URI for every environment you'll sign in from:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-vercel-domain>/api/auth/callback/google`
3. Put the client ID/secret in `.env.local` (dev) and in your Vercel project's
   environment variables (production) as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
4. The **same** client ID must be set as `GOOGLE_CLIENT_ID` on the backend,
   since the backend independently verifies the Google ID token's `aud` claim.

### First login

Signing in with Google is not enough on its own — the backend only accepts
administrators that already exist in its database with `status = ACTIVE`
(see `../vpn-backend/scripts/seed-admin.sql`). Signing in with an
unprovisioned Google account shows "Your Google account is not authorized
to access this system."

## How authentication works

1. Auth.js runs the Google OAuth flow entirely within this app.
2. On first sign-in, the `jwt` callback (`src/lib/auth/auth.ts`) sends the
   raw Google ID token to `POST /api/v1/auth/google`. The backend verifies
   it, checks the admin exists and is `ACTIVE`, and returns its own session
   token plus the admin's role.
3. That backend token is kept inside Auth.js's own encrypted session (never
   exposed to `NEXT_PUBLIC_*`) and attached as `Authorization: Bearer` on
   every API call from `src/lib/api/client.ts`.
4. `src/proxy.ts` (Next.js's proxy/middleware) redirects unauthenticated
   requests to `/login` and redirects an authenticated session away from
   `/login`.
5. Role-based UI (`src/components/common/role-gate.tsx`) only hides
   controls a role can't use — it is **not** a security boundary. The
   backend re-checks the role from PostgreSQL on every request and is the
   only source of truth for authorization.

## Project structure

```text
src/
├── app/                  routes (App Router)
│   ├── login/
│   └── (dashboard)/      dashboard, users, devices, access-keys, servers,
│                         usage, audit-logs, settings - behind AppShell
├── components/
│   ├── ui/                shadcn/ui primitives
│   ├── layout/             sidebar, top nav, app shell
│   ├── dashboard/          stat cards, server card
│   ├── users/ devices/ access-keys/ servers/   per-resource forms/dialogs
│   ├── charts/            recharts wrappers (bandwidth, connections, metrics)
│   └── common/            empty/error/loading states, pagination, role gate
├── hooks/                 TanStack Query hooks per resource
├── lib/
│   ├── api/                typed fetch client + per-resource functions
│   └── auth/               Auth.js config, permission helpers
├── types/                 API response types (mirrors the Go backend's JSON)
└── providers/              QueryClientProvider + SessionProvider
```

## Deploying to Vercel

1. Push this directory as its own repository (or import the monorepo and
   set the Vercel project's root directory to `vpn-frontend`).
2. Set the environment variables above in the Vercel project settings.
3. Add the Vercel deployment's domain as an authorized Google OAuth
   redirect URI (`https://<domain>/api/auth/callback/google`).
4. Point `NEXT_PUBLIC_API_URL` at the production backend
   (`https://api.vpn.thestrm.space`).

Never hardcode production secrets in this repository — only in Vercel's
environment variable settings.

## Testing

```bash
npm test
```

Component/unit tests use Vitest + Testing Library. They cover the login
gate, protected-route redirects, role-based UI, and the API client's error
handling — see `src/**/*.test.tsx`.

## Quality

```bash
npm run lint
npx tsc --noEmit
npm run build
```
