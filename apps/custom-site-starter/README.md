# Custom site starter (Custom plan)

Minimal Next.js starter for churches on the **Custom** product tier.

This app is intentionally thin: it resolves a tenant via `CHURCH_SLUG` and loads public content from the shared Church Stack API — the **same database** your white-label mobile app uses.

## Quick start

```bash
# from repo root
cp -R apps/custom-site-starter apps/custom-sites/my-church
cd apps/custom-sites/my-church
# set CHURCH_SLUG + PLATFORM_API_URL in .env.local
npm run dev --workspace=web   # API on :3000
# then run this app (add to turbo/workspaces if needed)
```

## Required env

| Variable | Example |
|----------|---------|
| `CHURCH_SLUG` | `grace` |
| `PLATFORM_API_URL` | `http://localhost:3000/api/trpc` |

## Data access

Use the same public procedure as `apps/church-site`:

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: process.env.PLATFORM_API_URL! })],
});

const site = await client.church.getPublicSite.query({
  slug: process.env.CHURCH_SLUG!,
});
```

Build any custom layout, pages, or features on top. Do **not** add a second MySQL database for the church.

See [docs/custom-site-delivery.md](../../docs/custom-site-delivery.md) for the full delivery model.
