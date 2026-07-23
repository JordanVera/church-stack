'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SermonsPanel({ churchId, slug }: { churchId: string; slug: string }) {
  const utils = trpc.useUtils();
  const dash = trpc.church.getOwnerDashboard.useQuery({ slug });
  const preview = trpc.church.ownerPreviewSermons.useQuery(
    { churchId },
    { enabled: Boolean(dash.data?.sermonsYoutubePlaylistId) }
  );
  const [sourceUrl, setSourceUrl] = useState('');

  useEffect(() => {
    setSourceUrl(dash.data?.sermonsYoutubeSourceUrl ?? '');
  }, [dash.data?.sermonsYoutubeSourceUrl]);

  const save = trpc.church.ownerUpdateSermonsPlaylist.useMutation({
    onSuccess: async (data) => {
      toast.success(
        data.sermonsYoutubePlaylistId
          ? 'Sermons playlist saved — videos will show on your site'
          : 'Sermons playlist cleared'
      );
      await utils.church.getOwnerDashboard.invalidate({ slug });
      await utils.church.ownerPreviewSermons.invalidate({ churchId });
    },
    onError: (err) => toast.error(err.message),
  });

  const data = dash.data;
  if (!data) return null;

  if (!data.sermonsEnabled) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Sermons</h2>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Sermons are disabled for this church. Contact support if you need them turned on.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Sermons</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Link a YouTube playlist or channel. Videos appear in a grid on your white-label site.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">YouTube playlist or channel</CardTitle>
          <CardDescription>
            Paste a playlist URL (recommended) or a channel /@handle. We resolve channels to their
            uploads playlist. Up to 100 videos are shown on your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sermons-url">URL</Label>
            <Input
              id="sermons-url"
              type="url"
              className="mt-1 h-10"
              placeholder="https://www.youtube.com/playlist?list=PL… or https://www.youtube.com/@yourchurch"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
              Examples: playlist?list=PLxxxx · youtube.com/@yourchurch · youtube.com/channel/UCxxxx
            </p>
          </div>

          {data.sermonsYoutubePlaylistId ? (
            <p className="text-sm text-ink-600 dark:text-ink-300">
              Connected playlist id:{' '}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs dark:bg-ink-800">
                {data.sermonsYoutubePlaylistId}
              </code>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={save.isPending}
              onClick={() =>
                save.mutate({
                  churchId,
                  sourceUrl: sourceUrl.trim() || null,
                })
              }
            >
              {save.isPending ? 'Saving…' : 'Save playlist'}
            </Button>
            {data.sermonsYoutubePlaylistId ? (
              <Button
                variant="outline"
                disabled={save.isPending}
                onClick={() => {
                  setSourceUrl('');
                  save.mutate({ churchId, sourceUrl: null });
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {data.sermonsYoutubePlaylistId ? (
        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Preview</h3>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Latest videos from your playlist (full grid on the public site).
          </p>
          {preview.isLoading ? (
            <p className="mt-4 text-sm text-ink-500">Loading preview…</p>
          ) : preview.error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{preview.error.message}</p>
          ) : preview.data?.videos.length ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {preview.data.videos.map((video) => (
                <li
                  key={video.videoId}
                  className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800"
                >
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {video.thumbnailUrl ? (
                      <div className="relative aspect-video bg-ink-100 dark:bg-ink-800">
                        <Image
                          src={video.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium text-ink-900 dark:text-white">
                        {video.title}
                      </p>
                      {video.duration ? (
                        <p className="mt-1 text-xs text-ink-500">{video.duration}</p>
                      ) : null}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-500">No public videos found in this playlist yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function SermonsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <SermonsPanel churchId={churchId} slug={slug} />}
    </ChurchDashboardProvider>
  );
}
