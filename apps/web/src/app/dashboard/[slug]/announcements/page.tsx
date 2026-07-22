'use client';

import { useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function AnnouncementsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.announcements.adminList.useQuery({ churchId });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(true);

  const create = trpc.announcements.create.useMutation({
    onSuccess: async () => {
      toast.success('Announcement created');
      setTitle('');
      setBody('');
      setPublished(true);
      await utils.announcements.adminList.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.announcements.update.useMutation({
    onSuccess: async () => {
      toast.success('Announcement updated');
      await utils.announcements.adminList.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.announcements.delete.useMutation({
    onSuccess: async () => {
      toast.success('Announcement deleted');
      await utils.announcements.adminList.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Announcements
        </h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Publish updates to your site and app. Available whether or not Planning Center is linked.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">New announcement</p>
          <div>
            <Label htmlFor="an-title">Title</Label>
            <Input
              id="an-title"
              className="mt-1 h-10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="an-body">Body</Label>
            <textarea
              id="an-body"
              className="mt-1 min-h-28 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publish immediately
          </label>
          <Button
            disabled={create.isPending || !title.trim() || !body.trim()}
            onClick={() => create.mutate({ churchId, title, body, published })}
          >
            {create.isPending ? 'Saving…' : 'Create announcement'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No announcements yet.</p>
        ) : null}
        {list.data?.map((a) => (
          <Card key={a.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900 dark:text-white">{a.title}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {a.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">
                    {a.body}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update.mutate({
                        churchId,
                        id: a.id,
                        published: !a.published,
                      })
                    }
                  >
                    {a.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Delete “${a.title}”?`)) {
                        remove.mutate({ churchId, id: a.id });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AnnouncementsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <AnnouncementsPanel churchId={churchId} />}
    </ChurchDashboardProvider>
  );
}
