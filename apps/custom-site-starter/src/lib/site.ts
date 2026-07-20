import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

function apiUrl() {
  const fromEnv = process.env.PLATFORM_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv.endsWith('/api/trpc') ? fromEnv : `${fromEnv}/api/trpc`;
  }
  const nextAuth = process.env.NEXTAUTH_URL?.replace(/\/$/, '');
  if (nextAuth) return `${nextAuth}/api/trpc`;
  return 'http://localhost:3000/api/trpc';
}

export function resolveChurchSlug(): string | null {
  const fromEnv = process.env.CHURCH_SLUG?.trim();
  if (fromEnv) return fromEnv;
  return null;
}

export function createSiteClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: apiUrl() })],
  });
}

export async function loadPublicSite(slug: string) {
  const client = createSiteClient();
  return client.church.getPublicSite.query({ slug });
}
