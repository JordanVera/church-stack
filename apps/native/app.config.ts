import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamic Expo config for hybrid whitelabel.
 *
 * The app runs in multi-tenant mode by default (church picker at runtime).
 * To produce a per-church branded build later, set `EXPO_PUBLIC_TENANT` (and
 * optionally the vars below) in an EAS build profile — no code changes needed.
 */
const tenant = process.env.EXPO_PUBLIC_TENANT;

const perChurch = {
  name: process.env.EXPO_PUBLIC_APP_NAME,
  slug: process.env.EXPO_PUBLIC_APP_SLUG,
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME,
  icon: process.env.EXPO_PUBLIC_APP_ICON,
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: perChurch.name ?? 'Church Stack',
  slug: perChurch.slug ?? 'church-stack',
  scheme: perChurch.scheme ?? 'churchstack',
  version: '1.0.0',
  orientation: 'portrait',
  icon: perChurch.icon ?? './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#f6e8ea',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID ?? 'com.churchstack.app',
  },
  android: {
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? 'com.churchstack.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#f6e8ea',
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  extra: {
    // Surfaced via expo-constants for runtime tenant resolution.
    // Only include when set (omit rather than emit null, which Expo serializes as {}).
    ...(tenant ? { defaultTenant: tenant } : {}),
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  },
});
