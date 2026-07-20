# White-label / hybrid mobile builds

The native app runs in **SHARED** mode by default (church picker at runtime). Paid churches can get a **WHITELABEL** store build.

## Profiles (`eas.json`)

| Profile | Use |
|---------|-----|
| `shared` | Church Stack branded store app |
| `whitelabel` | Per-church build — set tenant env vars |

## Queue from /dev

1. Open `/dev/churches/{slug}`
2. Set plan to **WHITELABEL**
3. Click **Queue white-label build**

With `EXPO_TOKEN` + `EAS_PROJECT_ID` set on the platform API host, /dev attempts to start an EAS build. Otherwise the DB is marked `QUEUED` and /dev shows the manual command.

## Manual white-label build

From `apps/native`:

```bash
EXPO_PUBLIC_TENANT=grace \
EXPO_PUBLIC_APP_NAME="Grace Community Church" \
EXPO_PUBLIC_APP_SLUG=cs-grace \
EXPO_PUBLIC_APP_SCHEME=csgrace \
EXPO_PUBLIC_IOS_BUNDLE_ID=com.churchstack.grace \
EXPO_PUBLIC_ANDROID_PACKAGE=com.churchstack.grace \
eas build --profile whitelabel --platform all
```

`app.config.ts` already reads these env vars for name, icon, scheme, and bundle IDs.
