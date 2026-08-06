# Gatherly Stack — Native

Expo / React Native app (tenant-aware church app shell) on **Expo SDK 54**.

## Styling

UI uses **[Uniwind](https://docs.uniwind.dev)** + **Tailwind CSS v4** (`className` utilities).

- Theme tokens live in [`global.css`](./global.css) (`@theme`) and mirror `apps/web` brand / ink / accent + dark surfaces.
- Metro is wrapped with `withUniwindConfig` in [`metro.config.js`](./metro.config.js).
- Import `../global.css` from [`app/_layout.tsx`](./app/_layout.tsx) (not `index.js`).
- Dynamic church branding colors still use inline `style` (runtime theme).
- Animated transforms/opacity stay on `style` props.

```bash
# after dependency or Metro changes
npx expo start --clear
```

## Auth

Email/password sign-in and sign-up gate the app. The client stores a Bearer JWT (signed with the
same `NEXTAUTH_SECRET` as the web app) in SecureStore and sends it on every tRPC request.

- Users with church memberships only see those churches.
- Users without a membership pick a church; selecting calls `church.join` (MEMBER).
- Whitelabel builds (`EXPO_PUBLIC_TENANT`) auto-join that church when the user has no memberships.

## Whitelabel

See [WHITELABEL.md](./WHITELABEL.md) for EAS per-church builds.
