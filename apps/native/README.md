# Church Stack — Native

Expo / React Native app (tenant-aware church app shell). Uses plain `StyleSheet` styling today.

## Auth

Email/password sign-in and sign-up gate the app. The client stores a Bearer JWT (signed with the
same `NEXTAUTH_SECRET` as the web app) in SecureStore and sends it on every tRPC request.

- Users with church memberships only see those churches.
- Users without a membership pick a church; selecting calls `church.join` (MEMBER).
- Whitelabel builds (`EXPO_PUBLIC_TENANT`) auto-join that church when the user has no memberships.

## TODO: shadcn/ui does not apply here

`apps/web` was migrated to [shadcn/ui](https://ui.shadcn.com) (Button, Input, Label, Card, Badge, Separator).
shadcn/ui itself only targets React DOM (Tailwind CSS + Base UI/Radix primitives), so it **cannot** be installed
directly in this Expo/React Native app.

If we want a shadcn-equivalent design system here in the future, the options are:

- [`react-native-reusables`](https://reactnativereusables.com) — a shadcn-style component CLI/registry for
  React Native, built on NativeWind (Tailwind for RN) + `react-native-primitives`. This would require adding
  NativeWind + Tailwind config to this app first, then porting components one-by-one via its CLI (mirrors the
  shadcn workflow: copy-paste ownership, not an npm dependency).
- Keep the current `StyleSheet`-based approach and just hand-roll shared UI primitives (Button, Card, etc.) in
  `src/components/ui/` for consistency with the web app's component names/props, without adopting NativeWind.

No native UI code has been changed as part of the shadcn/ui migration — this file is just a pointer for
whoever picks this up next.
