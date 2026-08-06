# Church fulfillment checklist

Internal runbook for dogfooding one church end-to-end before launch. Prefer test Stripe + a real (or staging) Vercel env. Native/EAS is deferred for web launch.

## Env prerequisites

- [ ] Platform `apps/web` deployed (or local) with MySQL migrated (`npm run db:migrate` / apply pending migrations)
- [ ] Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, publishable key, `STRIPE_PRICE_SITE` / `GROWTH` / `CUSTOM`
- [ ] Webhook forwarding: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `PLATFORM_API_URL` (public URL of the platform API for church-site deploys)
- [ ] Vercel: `VERCEL_TOKEN`, `VERCEL_GIT_REPO`, optional `VERCEL_TEAM_ID`, `VERCEL_CHURCH_SITE_ROOT`
- [ ] `ALLOW_DEV_CONSOLE=false` (or unset) in production; set `PLATFORM_DEV_EMAILS` for ops
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` for owner dashboard / success mailto
- [ ] Optional: `YOUTUBE_API_KEY` (sermons playlist), `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (visit-plan emails)
- [ ] **Before public launch:** remove demo login credentials from `/login` (kept for local dogfood only)

## Happy path

1. **Pricing → payment (auth-gated)**
   - [ ] Marketing → `/pricing` → choose Site or Growth → `/billing/checkout?plan=…`
   - [ ] Create account or log in on checkout page → Stripe Checkout
   - [ ] After payment → `/billing/success?flow=pre_onboard` → **Register your church**

2. **Church registration**
   - [ ] `/onboard?plan=…` — church basics, pastors, campuses (requires paid subscription)
   - [ ] Optionally import campuses via Planning Center (confirm keys saved for post-signup sync)
   - [ ] Site plan: max 2 campuses enforced; Growth: 5; Custom: unlimited
   - [ ] Submit → `/billing/success?churchId=…` → dashboard

3. **Post-registration**
   - [ ] Land on `/billing/success` with **Go to your church home**
   - [ ] Webhook linked subscription to church; `planTier` and Stripe ids set
   - [ ] Best-effort auto-provision ran: `websiteStatus` moved off `NONE` (or logged failure if Vercel env missing)

4. **Ops fallback (`/dev/churches/[slug]`)**
   - [ ] If auto-provision failed: **Provision website**
   - [ ] Set / attach custom domain when ready
   - [ ] Confirm PCO keys present (from onboard) → **Sync Planning Center**
   - [ ] For Growth: set **Giving URL** (or have owner set it on dashboard Settings)

5. **Owner home**
   - [ ] Owner signs in at `/login` → `/dashboard`
   - [ ] Sees plan, website status, site link when LIVE
   - [ ] **Manage billing** opens Stripe Customer Portal
   - [ ] Settings: branding colors, logo, theme default, contact, social, giving URL
   - [ ] Integrations: owner can sync Planning Center campuses/services
   - [ ] Sermons: optional YouTube playlist
   - [ ] Visits: list of plan-a-visit submissions

6. **Public church site**
   - [ ] Open `websiteUrl` or `church-site?slug=…`
   - [ ] Locations & service times, pastors, life groups, announcements, events
   - [ ] Plan a visit works; admin email notify when Resend is configured
   - [ ] Give CTA/section only if `givingUrl` is set (external link)
   - [ ] Sermons grid + Load more when YouTube playlist is linked

## Rollback / notes

- Auto-provision never fails the Stripe webhook after tier update; retry from `/dev`.
- Site Give does not use `givingEnabled` alone — URL must be set.
- Owner PCO sync on Integrations is live; `/dev` sync remains available for ops.
- Apply schema migrations before deploy (e.g. `VisitPlan`, `siteThemeDefault`, YouTube sermon fields).
- `ALLOW_DEV_CONSOLE=true` with empty `PLATFORM_DEV_EMAILS` is denied in Vercel production.
