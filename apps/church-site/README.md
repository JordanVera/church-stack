# Church site template

Per-church Next.js public website. Each Vercel project is locked to one tenant via `CHURCH_SLUG`.

## Local preview

With the platform API running on port 3000:

```bash
CHURCH_SLUG=grace PLATFORM_API_URL=http://localhost:3000 npm run dev --workspace=church-site
```

Or open http://localhost:3001?slug=grace (when `CHURCH_SLUG` is unset).

## Production env (per Vercel project)

| Variable | Purpose |
|----------|---------|
| `CHURCH_SLUG` | Tenant this deploy serves |
| `PLATFORM_API_URL` | Platform web origin hosting `/api/trpc` |

Provisioned automatically from `/dev` when `VERCEL_TOKEN` + `VERCEL_GIT_REPO` are set.
