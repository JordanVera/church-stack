'use client';

import { useState } from 'react';

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
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p
        className="text-xs font-semibold uppercase tracking-[0.22em]"
        style={{ color: accentColor }}
      >
        Listen
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
        Sermons
      </h2>
      <p className="mt-3 max-w-xl text-stone-600">Recent messages to watch and share.</p>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.videoId}>
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] group-hover:opacity-95"
                  />
                ) : null}
                {video.duration ? (
                  <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
                    {video.duration}
                  </span>
                ) : null}
              </div>
              <div className="pt-3">
                <h3 className="line-clamp-2 text-base font-semibold group-hover:underline">
                  {video.title}
                </h3>
                {video.publishedAt ? (
                  <p className="mt-1 text-xs text-stone-500">
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
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-md px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Loading…' : 'Load more sermons'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
