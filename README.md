# Church Stack

A Turborepo monorepo for building and shipping whitelabel apps for small-to-medium churches, fast.

## What's inside

```
apps/
  web/       Next.js 16 marketing site + tRPC HTTP handler + next-auth
  native/    Expo (expo-router) mobile app with runtime tenant theming
packages/
  api/               Shared tRPC router + context (consumed by web and native)
  database/          Prisma client + multi-tenant MySQL schema + seed
  config/            Shared whitelabel/tenant branding types and defaults
  typescript-config/ Shared tsconfig presets
```

## Architecture

- **Shared API** – The tRPC router lives in `@repo/api` and is imported by both `apps/web`
  (which hosts the HTTP handler at `/api/trpc`) and `apps/native` (which calls it over HTTP).
- **Multi-tenant backend** – Every domain row is keyed by `churchId`. A `Church` row holds
  each tenant's branding (name, colors, logo).
- **Hybrid whitelabel** – The native app resolves its tenant at runtime (church picker), but
  reads an `EXPO_PUBLIC_TENANT` hook first, so a per-church branded EAS build can be produced
  later by only setting env/config, without code changes.

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

   - Web: http://localhost:3000
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

- **Web** is the neutral SaaS marketing brand (not per-church).
- **Native** resolves a tenant slug in this order:
  1. `EXPO_PUBLIC_TENANT` (build-time — used for per-church store builds later)
  2. A previously selected church (persisted)
  3. The in-app church picker
  Once resolved, it fetches `church.getBranding` and themes the whole app via `TenantProvider`.
