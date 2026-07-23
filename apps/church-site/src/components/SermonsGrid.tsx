'use client';

import { useState } from 'react';
import { SectionShell } from '@/components/SectionShell';

export type SermonCard = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
};

type Props = {
  slug: string;
  initialVideos: SermonCard[];
  initialNextPageToken: string | null;
  accentColor: string;
};

export function SermonsGrid({ slug, initialVideos, initialNextPageToken, accentColor }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [nextPageToken, setNextPageToken] = useState(initialNextPageToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!nextPageToken || loading) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        slug,
        pageToken: nextPageToken,
      });
      const res = await fetch(`/api/sermons?${params.toString()}`);
      const body = (await res.json()) as {
        ok: boolean;
        videos?: SermonCard[];
        nextPageToken?: string | null;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Failed to load more sermons');
      }
      const incoming = body.videos ?? [];
      setVideos((prev) => {
        const seen = new Set(prev.map((v) => v.videoId));
        const merged = [...prev];
        for (const v of incoming) {
          if (!seen.has(v.videoId)) {
            seen.add(v.videoId);
            merged.push(v);
          }
        }
        return merged;
      });
      setNextPageToken(body.nextPageToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more sermons');
    } finally {
      setLoading(false);
    }
  };

  if (videos.length === 0) return null;

  return (
    <SectionShell tone="default">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          Listen
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Sermons
        </h2>
        <p className="mt-5 max-w-xl text-lg text-[var(--site-muted)]">
          Recent messages to watch and share.
        </p>

        <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.videoId}>
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative aspect-video overflow-hidden bg-[var(--site-band-alt)]">
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  {video.duration ? (
                    <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
                      {video.duration}
                    </span>
                  ) : null}
                </div>
                <div className="pt-4">
                  <h3 className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:underline">
                    {video.title}
                  </h3>
                  {video.publishedAt ? (
                    <p className="mt-1.5 text-xs uppercase tracking-[0.12em] text-[var(--site-muted)]">
                      {new Date(video.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  ) : null}
                </div>
              </a>
            </li>
          ))}
        </ul>

        {error ? <p className="mt-6 text-center text-sm text-red-600">{error}</p> : null}

        {nextPageToken ? (
          <div className="mt-14 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="rounded-md px-6 py-3.5 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {loading ? 'Loading…' : 'Load more sermons'}
            </button>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
