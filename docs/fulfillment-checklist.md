# Church fulfillment checklist

Internal runbook for dogfooding one church end-to-end before launch. Prefer test Stripe + a real (or staging) Vercel/EAS env.

## Env prerequisites

- [ ] Platform `apps/web` deployed (or local) with MySQL migrated (`npm run db:push`)
- [ ] Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, publishable key, `STRIPE_PRICE_SITE` / `GROWTH` / `CUSTOM`
- [ ] Webhook forwarding: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] `PLATFORM_API_URL` (public URL of the platform API for church-site deploys)
- [ ] Vercel: `VERCEL_TOKEN`, `VERCEL_GIT_REPO`, optional `VERCEL_TEAM_ID`, `VERCEL_CHURCH_SITE_ROOT`
- [ ] EAS (if testing white-label mobile): `EXPO_TOKEN`, `EAS_PROJECT_ID`
- [ ] `ALLOW_DEV_CONSOLE=false` in production; `PLATFORM_DEV_EMAILS` set for ops
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` for owner dashboard / success mailto

## Happy path

1. **Signup**
   - [ ] Marketing → `/pricing` → choose Site or Growth → `/onboard?plan=…`
   - [ ] Optionally import campuses via Planning Center (confirm “token saved for post-signup sync”)
   - [ ] Submit → `/billing/subscribe` → register/login → Stripe Checkout

2. **Post-payment**
   - [ ] Land on `/billing/success` with **Go to your church home**
   - [ ] Webhook updated `Church.planTier`, Stripe customer/subscription ids
   - [ ] `claimAndCheckout` created `OWNER` membership for the paying user
   - [ ] Best-effort auto-provision ran: `websiteStatus` moved off `NONE` (or logged failure if Vercel env missing)

3. **Ops fallback (`/dev/churches/[slug]`)**
   - [ ] If auto-provision failed: **Provision website**
   - [ ] Set / attach custom domain when ready
   - [ ] Confirm PCO keys present (from onboard) → **Sync Planning Center**
   - [ ] For Growth: set **Giving URL** (or have owner set it on `/dashboard`)

4. **Owner home**
   - [ ] Owner signs in at `/login` → `/dashboard`
   - [ ] Sees plan, website status, site link when LIVE
   - [ ] **Manage billing** opens Stripe Customer Portal
   - [ ] Growth/Custom: can save giving URL

5. **Public church site**
   - [ ] Open `websiteUrl` or `church-site?slug=…`
   - [ ] Locations & service times render from onboard/PCO data
   - [ ] Give CTA/section only if `givingUrl` is set (external link)

6. **Mobile**
   - [ ] Smoke SHARED picker against platform API, **or**
   - [ ] Queue WHITELABEL build from `/dev` and note App Store submission is still manual

## Rollback / notes

- Auto-provision never fails the Stripe webhook after tier update; retry from `/dev`.
- Site Give does not use `givingEnabled` alone — URL must be set.
- Ongoing PCO sync remains engineer-triggered in `/dev` for this launch pass.
