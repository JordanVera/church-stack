# Deploying Church Stack

This guide covers deploying the **platform web app** (`apps/web`) to Vercel, how shared packages work in production, and how that differs from per-church sites.

## What you are deploying

| App                | Role                                                                   | How it ships                                               |
| ------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/web`         | SaaS platform (marketing, auth, dashboard, `/admin`, `/dev`, tRPC API) | **One** Vercel project you create manually                 |
| `apps/church-site` | Per-church public website                                              | Separate Vercel project **per church** (often from `/dev`) |
| `apps/native`      | Expo mobile app                                                        | EAS / App Store — not Vercel                               |

This document focuses on **`apps/web` only**.

---

## Deploy `apps/web` to Vercel

You do **not** need to change scripts in `apps/web/package.json`. Configure install/build in the Vercel project settings.

### 1. Create the project

1. Go to [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Import this Git repository (`church-stack`).
3. Set **Root Directory** to:

   ```
   apps/web
   ```

4. Framework preset should detect **Next.js**.

Root Directory is what makes this project build only the platform app — not `church-site` or `native`.

### 2. Build & Development settings

In the Vercel project → **Settings → Build and Deployment** (or the import wizard overrides):

| Setting              | Value                             |
| -------------------- | --------------------------------- |
| **Root Directory**   | `apps/web`                        |
| **Install Command**  | `cd ../.. && npm install`         |
| **Build Command**    | `npm run build` (default is fine) |
| **Output Directory** | leave blank (Next.js default)     |

**Why the custom Install Command?**  
This is an npm workspaces monorepo. The lockfile and workspace packages (`@repo/api`, `@repo/database`, `@repo/config`) live at the **repo root**. Installing only inside `apps/web` will not wire those packages correctly.

Keep Vercel’s option to **include files outside the Root Directory** enabled (default for monorepos) so `packages/` is available during the build.

Optional Build Command (equivalent, uses Turbo from the repo root):

```bash
cd ../.. && npx turbo run build --filter=web
```

### 3. Environment variables

Set these on the Vercel project (Production, and Preview if you use preview deploys). See [`.env.example`](.env.example) for the full list.

| Variable                                               | Required    | Notes                                                                          |
| ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`                                         | Yes         | Production MySQL URL (not `localhost`)                                         |
| `NEXTAUTH_SECRET`                                      | Yes         | Long random string                                                             |
| `NEXTAUTH_URL`                                         | Yes         | Public URL of this deploy, e.g. `https://your-app.vercel.app`                  |
| `PLATFORM_DEV_EMAILS`                                  | Recommended | Comma-separated emails allowed into `/dev`                                     |
| `ALLOW_DEV_CONSOLE`                                    | No          | Prefer unset/`false` in production (alone is denied on Vercel production)      |
| `PLATFORM_API_URL`                                     | Recommended | Public tRPC base for church sites, e.g. `https://your-app.vercel.app/api/trpc` |
| `NEXT_PUBLIC_CHURCH_SITE_PREVIEW_URL`                  | No          | Local/dev preview helper                                                       |
| `YOUTUBE_API_KEY`                                      | Recommended | YouTube Data API v3 key for church sermons playlists                           |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`                  | No          | Optional email notify for plan-a-visit submissions                             |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_GIT_REPO`, … | No          | Only if you use `/dev` to provision church websites                            |
| `EXPO_TOKEN`, `EAS_PROJECT_ID`                         | No          | Only if you use `/dev` for white-label mobile builds                           |

After the first successful deploy, point `NEXTAUTH_URL` and `PLATFORM_API_URL` at the real production URL.

### 4. Deploy

- Push to the Git branch connected to the project, **or**
- Redeploy from the Vercel dashboard.

CLI alternative (from your machine):

```bash
npx vercel --cwd apps/web
```

Prefer the Git-connected project with Root Directory `apps/web` so every push rebuilds this app consistently.

### 5. Database

The Vercel build runs `prisma generate` (via `apps/web`’s `postinstall`). That prepares the Prisma client; it does **not** apply schema changes to MySQL.

When the schema changes, update the production database yourself (e.g. `db:push` or migrations against the production `DATABASE_URL`) before or as you deploy.

---

## Shared packages (`@repo/*`) — what to do when they change

`apps/web` depends on private workspace packages:

- `@repo/api`
- `@repo/database`
- `@repo/config`

These are **not published to npm**. They live in this repo under `packages/` and are linked by npm workspaces (`"@repo/api": "*"` etc.).

### Normal workflow

1. Edit code under `packages/api`, `packages/database`, `packages/config`, and/or `apps/web`.
2. Commit and push to the branch Vercel watches.
3. Vercel clones the whole monorepo, installs from the root, and rebuilds `apps/web` against the package source on that commit.

No version bumps, no `npm publish`, and no separate Vercel project for the packages.

### Prisma schema changes

1. Update `packages/database` schema as needed.
2. Apply the schema to **production** MySQL (migrate / push).
3. Push the commit so Vercel rebuilds `web` with a regenerated client.

### Optional: skip unrelated rebuilds

By default, **any** push to the connected branch can redeploy `web` (including changes that only touch `apps/native` or docs). That is fine and safest while getting started.

Later you can add an Ignored Build Step (e.g. `npx turbo-ignore web`) so Vercel only builds when `web` or its dependency graph changes. That is an optimization — not required for package updates to ship.

---

## Do not confuse with church-site deploys

Per-church sites use **`apps/church-site`** as the Root Directory (see `VERCEL_CHURCH_SITE_ROOT` in `.env.example`). Those projects are separate from the platform and are often created from `/dev` when `VERCEL_TOKEN` + `VERCEL_GIT_REPO` are set.

| Project                  | Root Directory                                                 |
| ------------------------ | -------------------------------------------------------------- |
| Platform SaaS            | `apps/web`                                                     |
| One church’s public site | `apps/church-site` (+ `CHURCH_SLUG`, `PLATFORM_API_URL`, etc.) |

---

## Quick checklist

- [ ] Vercel project Root Directory = `apps/web`
- [ ] Install Command = `cd ../.. && npm install`
- [ ] Build Command = `npm run build` (or Turbo filter above)
- [ ] Env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Env: `PLATFORM_DEV_EMAILS` (and production-safe `/dev` settings)
- [ ] Env: `PLATFORM_API_URL` pointing at this deploy’s `/api/trpc`
- [ ] Production DB reachable and schema up to date
- [ ] Push to the connected branch → confirm deploy succeeds
