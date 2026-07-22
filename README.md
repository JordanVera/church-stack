# Church Stack

A Turborepo monorepo for building and shipping whitelabel apps for small-to-medium churches, fast.

## What's inside

```
apps/
  web/                   Next.js 16 platform (marketing, auth, /admin, /dev, tRPC, Stripe)
  church-site/           White-label public site template (one Vercel project each)
  custom-site-starter/   Starter for Custom-tier Next.js sites (same shared API/DB)
  native/                Expo mobile app — white-label EAS for paid tiers
packages/
  api/               Shared tRPC router + PCO sync + Vercel/EAS/Stripe helpers
  database/          Prisma client + multi-tenant MySQL schema + seed
  config/            Branding types + PlanTier definitions (Site/Growth/Custom)
  typescript-config/ Shared tsconfig presets
docs/
  custom-site-delivery.md
  positioning.md         Competitive positioning & ICP matrices
  fulfillment-checklist.md  Post-checkout ops runbook (dogfood)
```

## Architecture

- **Shared API** – The tRPC router lives in `@repo/api` and is imported by both `apps/web`
  (which hosts the HTTP handler at `/api/trpc`) and `apps/native` / `apps/church-site`
  (which call it over HTTP).
- **Multi-tenant backend** – One shared MySQL database. Every domain row is keyed by
  `churchId`. A `Church` row holds branding, `planTier` (Site / Growth / Custom),
  website/mobile provisioning, and Stripe subscription ids.
- **Websites** – White-label deploys from `apps/church-site` (custom domain attach via
  Vercel). Custom-tier sites use [`apps/custom-site-starter`](apps/custom-site-starter) /
  [`docs/custom-site-delivery.md`](docs/custom-site-delivery.md) — still the same API/DB.
- **Mobile** – White-label EAS builds (`MobilePlan.WHITELABEL`) are the default for paid
  tiers; SHARED remains for trials. See [`apps/native/WHITELABEL.md`](apps/native/WHITELABEL.md).
- **Planning Center** – Syncs campuses, events, and life groups into shared tables
  (`externalId` + `source`). Web and mobile always read Church Stack, not PCO directly.
- **Billing** – Stripe Checkout / Customer Portal + webhook map prices to `planTier`.
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

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Run web + native + package watchers via Turbo |
| `npm run build`     | Build all apps/packages                       |
| `npm run db:push`   | Push the Prisma schema to the database        |
| `npm run db:seed`   | Seed demo churches + owner users              |
| `npm run db:studio` | Open Prisma Studio                            |
| `npm run format`    | Prettier across the repo                      |

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

## Stripe billing

Monthly subscriptions map Stripe Price IDs → `Church.planTier` (Site / Growth / Custom).

1. In the [Stripe Dashboard](https://dashboard.stripe.com/), create three Products with **monthly** Prices:
   - Site — $129/mo
   - Growth — $249/mo
   - Custom — $599/mo (or your Custom base)
2. Copy each Price ID into `.env`:

   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_SITE=price_...
   STRIPE_PRICE_GROWTH=price_...
   STRIPE_PRICE_CUSTOM=price_...
   ```

3. Add a webhook endpoint to `https://<your-host>/api/stripe/webhook` (locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`) for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Enable the **Customer Portal** (cancel subscription + update payment method).

Flow: `/pricing` → `/onboard?plan=…` → `/billing/subscribe` (claim admin + Checkout) → webhook updates `planTier`. Staff can also start Checkout / Portal from `/dev/churches/[slug]`.

## Deploying

See [`DEPLOY.md`](DEPLOY.md) for deploying `apps/web` to Vercel, env vars, and how shared `@repo/*` packages ship with each deploy.
