import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';
import type { TenantBranding } from '@repo/config';

export type PublicSitePayload = {
  branding: TenantBranding;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    timezone: string;
  };
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startsAt: Date;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date;
  }>;
  sermonSeries: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  }>;
  /** First page of YouTube playlist videos when the church linked a sermons playlist. */
  sermons: Array<{
    videoId: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
    duration?: string;
  }>;
  /** YouTube playlistItems nextPageToken for Load more (null when no more). */
  sermonsNextPageToken: string | null;
  sermonsYoutubePlaylistId: string | null;
  lifeGroups: Array<{
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    meetingDay: number | null;
    meetingTime: string | null;
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string | null;
    services: Array<{
      id: string;
      name: string;
      dayOfWeek: number;
      startTime: string;
    }>;
  }>;
};

function apiBase(): string {
  return (
    process.env.PLATFORM_API_URL?.replace(/\/$/, '') ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  );
}

/**
 * Resolve which church this deploy serves.
 * Production Vercel projects set `CHURCH_SLUG`.
 * Local preview may pass `?slug=` (or rely on env).
 */
export function resolveChurchSlug(searchSlug?: string | null): string | null {
  const fromEnv = process.env.CHURCH_SLUG?.trim();
  if (fromEnv) return fromEnv;
  if (searchSlug?.trim()) return searchSlug.trim();
  return null;
}

function createClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiBase()}/api/trpc`,
      }),
    ],
  });
}

export async function fetchPublicSite(slug: string): Promise<PublicSitePayload | null> {
  try {
    const client = createClient();
    return (await client.church.getPublicSite.query({ slug })) as PublicSitePayload | null;
  } catch (err) {
    console.error('church.getPublicSite failed', err);
    return null;
  }
}
