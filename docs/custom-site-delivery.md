# Custom Next.js site delivery (Custom plan)

Custom-tier churches get a **fully custom Next.js website** that still uses the **same shared Church Stack API and MySQL database** as their white-label mobile apps. Do not provision a separate database per church.

## Architecture

```
apps/custom-sites/<church-slug>/   ← per-church Next.js app (Custom MRR)
        │
        │  HTTP tRPC (PLATFORM_API_URL)
        ▼
apps/web /api/trpc                 ← shared platform API
        │
        ▼
One RDS MySQL (churchId row isolation)
        ▲
apps/native (white-label) ─────────┘
```

- Tenant lock: `CHURCH_SLUG` (or `x-church-slug` header) — same pattern as [`apps/church-site`](../apps/church-site).
- Data: call `church.getPublicSite`, `events.*`, etc. Never call Planning Center from the custom site; sync writes into the shared DB first.
- Domain: attach the church’s `customDomain` on the custom Vercel project (same Domains API flow as white-label sites).

## Delivery checklist

1. Confirm church `planTier = CUSTOM` in `/dev` (or via Stripe price `STRIPE_PRICE_CUSTOM`).
2. Copy the starter from [`apps/custom-site-starter`](../apps/custom-site-starter) into `apps/custom-sites/<slug>/` (or a private repo).
3. Set env: `CHURCH_SLUG`, `PLATFORM_API_URL`.
4. Build custom pages/features against `@repo/api` / tRPC.
5. Deploy to Vercel; attach custom domain; set `Church.websiteUrl` / `vercelProjectId` from `/dev` if useful for ops.

## What stays on the platform

| Concern | Where |
|--------|--------|
| Auth / membership | Platform DB |
| Events, announcements, life groups, locations | Shared tables + `churchId` |
| Planning Center sync | Platform job (`church.syncPlanningCenter`) |
| Mobile app | Same tenant data via tRPC |

Custom work is **frontend + optional custom API routes that still talk to the shared DB through `@repo/api`**, not a siloed CMS.
