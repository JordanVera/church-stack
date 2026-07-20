# Church Stack

A Turborepo monorepo for building and shipping whitelabel apps for small-to-medium churches, fast.

## What's inside

```
apps/
  web/          Next.js 16 platform (marketing, auth, /admin, /dev, tRPC)
  church-site/  Per-church Next.js public site template (one Vercel project each)
  native/       Expo mobile app — shared picker by default, EAS white-label optional
packages/
  api/               Shared tRPC router + context + provision helpers
  database/          Prisma client + multi-tenant MySQL schema + seed
  config/            Shared whitelabel/tenant branding types and defaults
  typescript-config/ Shared tsconfig presets
```

## Architecture

- **Shared API** – The tRPC router lives in `@repo/api` and is imported by both `apps/web`
  (which hosts the HTTP handler at `/api/trpc`) and `apps/native` / `apps/church-site`
  (which call it over HTTP).
- **Multi-tenant backend** – Every domain row is keyed by `churchId`. A `Church` row holds
  each tenant's branding (name, colors, logo) plus website/mobile provisioning state.
- **Websites** – Separate Next.js deploy per church from `apps/church-site`, locked via
  `CHURCH_SLUG`. Provision from `/dev` when Vercel credentials are set.
- **Hybrid mobile** – Shared App Store app by default; white-label EAS builds (`eas.json`
  profile `whitelabel`) for paid churches. See [`apps/native/WHITELABEL.md`](apps/native/WHITELABEL.md).
- **`/dev` console** – Engineer tools gated by `PLATFORM_DEV_EMAILS` (no DB flag). Product
  ops stay on `/admin` via `User.isAdmin`.

## Getting started

1. Install dependencies (from the repo root):

   ```bash
   npm install
   ```

2. Copy env and set your database URL:

   ```bash
   cp .env.example .env
   cp .env.example packages/database/.env
   ```

3. Push the schema and seed demo churches:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Run everything:

   ```bash
   npm run dev
   ```

   - Web (platform): http://localhost:3000
   - Church site template: `npm run dev --workspace=church-site` → http://localhost:3001?slug=grace
   - Native: press `w`/`i`/`a` in the Expo CLI, or scan the QR code.

## Useful scripts

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Run web + native + package watchers via Turbo   |
| `npm run build`     | Build all apps/packages                         |
| `npm run db:push`   | Push the Prisma schema to the database          |
| `npm run db:seed`   | Seed demo churches + owner users                |
| `npm run db:studio` | Open Prisma Studio                              |
| `npm run format`    | Prettier across the repo                        |

## Whitelabel / tenant resolution

- **Web (`apps/web`)** is the neutral SaaS platform brand (not per-church).
- **Church site (`apps/church-site`)** resolves tenant from `CHURCH_SLUG` (or `?slug=` locally).
- **Native** resolves a tenant slug in this order:
  1. `EXPO_PUBLIC_TENANT` (build-time — used for per-church store builds)
  2. A previously selected church (persisted)
  3. The in-app church picker
  Once resolved, it fetches `church.getBranding` and themes the whole app via `TenantProvider`.

## /dev access

Set in `.env`:

```bash
PLATFORM_DEV_EMAILS="you@example.com"
# Or for local only when the list is empty:
ALLOW_DEV_CONSOLE=true
```

Sign in with a matching email, then open http://localhost:3000/dev

## Deploying

See [`DEPLOY.md`](DEPLOY.md) for deploying `apps/web` to Vercel, env vars, and how shared `@repo/*` packages ship with each deploy.
