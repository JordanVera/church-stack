import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiUrl?: string;
  defaultTenant?: unknown;
};

/** Base URL of the web app that hosts the tRPC handler. */
export const API_URL = typeof extra.apiUrl === 'string' ? extra.apiUrl : 'http://localhost:3000';

/** Build-time tenant (set via EXPO_PUBLIC_TENANT) for per-church builds. */
export const DEFAULT_TENANT =
  typeof extra.defaultTenant === 'string' && extra.defaultTenant.length > 0
    ? extra.defaultTenant
    : null;
