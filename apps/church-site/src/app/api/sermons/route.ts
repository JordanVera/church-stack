import { NextResponse } from 'next/server';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

export const runtime = 'nodejs';

function apiBase(): string {
  return (
    process.env.PLATFORM_API_URL?.replace(/\/$/, '') ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  );
}

function resolveSlug(searchSlug: string | null): string | null {
  const fromEnv = process.env.CHURCH_SLUG?.trim();
  if (fromEnv) return fromEnv;
  if (searchSlug?.trim()) return searchSlug.trim();
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = resolveSlug(searchParams.get('slug'));
  const pageToken = searchParams.get('pageToken')?.trim() || undefined;

  if (!slug) {
    return NextResponse.json(
      { ok: false, error: 'Missing church slug', videos: [], nextPageToken: null },
      { status: 400 }
    );
  }

  try {
    const client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${apiBase()}/api/trpc`,
        }),
      ],
    });

    const result = await client.church.getPublicSermons.query({
      slug,
      pageToken,
      pageSize: 12,
    });

    return NextResponse.json({
      ok: true,
      videos: result.videos,
      nextPageToken: result.nextPageToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load sermons';
    console.error('[church-site /api/sermons]', message);
    return NextResponse.json(
      { ok: false, error: message, videos: [], nextPageToken: null },
      { status: 500 }
    );
  }
}
