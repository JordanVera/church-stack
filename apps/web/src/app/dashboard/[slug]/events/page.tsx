'use client';

import { useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { PcoLockedPanel } from '@/components/dashboard/DashboardShell';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function EventsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.events.adminList.useQuery({ churchId });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const create = trpc.events.create.useMutation({
    onSuccess: async () => {
      toast.success('Event created');
      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      await utils.events.adminList.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.events.delete.useMutation({
    onSuccess: async () => {
      toast.success('Event deleted');
      await utils.events.adminList.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Events</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Calendar events for your website and mobile app.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Create event</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                className="mt-1 h-10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ev-loc">Location (optional)</Label>
              <Input
                id="ev-loc"
                className="mt-1 h-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ev-start">Starts</Label>
              <Input
                id="ev-start"
                type="datetime-local"
                className="mt-1 h-10"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ev-end">Ends (optional)</Label>
              <Input
                id="ev-end"
                type="datetime-local"
                className="mt-1 h-10"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ev-desc">Description</Label>
              <textarea
                id="ev-desc"
                className="mt-1 min-h-24 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={create.isPending || !title.trim() || !startsAt}
            onClick={() =>
              create.mutate({
                churchId,
                title,
                description: description || null,
                location: location || null,
                startsAt: new Date(startsAt),
                endsAt: endsAt ? new Date(endsAt) : null,
              })
            }
          >
            {create.isPending ? 'Saving…' : 'Create event'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No events yet.</p>
        ) : null}
        {list.data?.map((ev: NonNullable<typeof list.data>[number]) => (
          <Card key={ev.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900 dark:text-white">{ev.title}</p>
                  {ev.source === 'PLANNING_CENTER' ? (
                    <Badge variant="outline" className="text-[10px]">
                      Synced
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {new Date(ev.startsAt).toLocaleString()}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Delete “${ev.title}”?`)) {
                    remove.mutate({ churchId, id: ev.id });
                  }
                }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId, planningCenterLinked }) =>
        planningCenterLinked ? (
          <PcoLockedPanel slug={slug} label="Events" />
        ) : (
          <EventsPanel churchId={churchId} />
        )
      }
    </ChurchDashboardProvider>
  );
}
