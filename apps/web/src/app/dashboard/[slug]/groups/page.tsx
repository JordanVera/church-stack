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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function GroupsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.lifeGroups.list.useQuery({ churchId });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const create = trpc.lifeGroups.create.useMutation({
    onSuccess: async () => {
      toast.success('Life group added');
      setName('');
      setDescription('');
      setLocation('');
      setMeetingDay('');
      setMeetingTime('');
      await utils.lifeGroups.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.lifeGroups.delete.useMutation({
    onSuccess: async () => {
      toast.success('Life group deleted');
      await utils.lifeGroups.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Life groups
        </h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Small groups for your site and app.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Add life group</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="g-name">Name</Label>
              <Input
                id="g-name"
                className="mt-1 h-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="g-loc">Location (optional)</Label>
              <Input
                id="g-loc"
                className="mt-1 h-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="g-day">Meeting day</Label>
              <select
                id="g-day"
                className="mt-1 flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-950"
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
              >
                <option value="">Not set</option>
                {DAYS.map((d, i) => (
                  <option key={d} value={String(i)}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="g-time">Meeting time (HH:mm)</Label>
              <Input
                id="g-time"
                className="mt-1 h-10"
                placeholder="19:00"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="g-desc">Description</Label>
              <textarea
                id="g-desc"
                className="mt-1 min-h-24 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={create.isPending || !name.trim()}
            onClick={() =>
              create.mutate({
                churchId,
                name,
                description: description || null,
                location: location || null,
                meetingDay: meetingDay === '' ? null : Number(meetingDay),
                meetingTime: meetingTime.trim() || null,
              })
            }
          >
            {create.isPending ? 'Saving…' : 'Add life group'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No life groups yet.</p>
        ) : null}
        {list.data?.map((g) => (
          <Card key={g.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900 dark:text-white">{g.name}</p>
                  {g.source === 'PLANNING_CENTER' ? (
                    <Badge variant="outline" className="text-[10px]">
                      Synced
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {[
                    g.location,
                    g.meetingDay != null ? DAYS[g.meetingDay] : null,
                    g.meetingTime,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'No schedule set'}
                </p>
                {g.description ? (
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{g.description}</p>
                ) : null}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Delete “${g.name}”?`)) {
                    remove.mutate({ churchId, id: g.id });
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

export default function GroupsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId, planningCenterLinked }) =>
        planningCenterLinked ? (
          <PcoLockedPanel slug={slug} label="Life groups" />
        ) : (
          <GroupsPanel churchId={churchId} />
        )
      }
    </ChurchDashboardProvider>
  );
}
