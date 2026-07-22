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

function LocationsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.locations.list.useQuery({ churchId });
  const pastors = trpc.pastors.list.useQuery({ churchId });

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [pastorId, setPastorId] = useState('');

  const create = trpc.locations.create.useMutation({
    onSuccess: async () => {
      toast.success('Location added');
      setName('');
      setAddress('');
      setPastorId('');
      await utils.locations.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.locations.update.useMutation({
    onSuccess: async () => {
      toast.success('Location updated');
      await utils.locations.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.locations.delete.useMutation({
    onSuccess: async () => {
      toast.success('Location deleted');
      await utils.locations.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const createService = trpc.locations.createService.useMutation({
    onSuccess: async () => {
      toast.success('Service added');
      await utils.locations.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteService = trpc.locations.deleteService.useMutation({
    onSuccess: async () => {
      toast.success('Service removed');
      await utils.locations.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Locations</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Campuses and weekly service times for your site and app.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Add location</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="loc-name">Name</Label>
              <Input
                id="loc-name"
                className="mt-1 h-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Campus"
              />
            </div>
            <div>
              <Label htmlFor="loc-pastor">Pastor (optional)</Label>
              <select
                id="loc-pastor"
                className="mt-1 flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-950"
                value={pastorId}
                onChange={(e) => setPastorId(e.target.value)}
              >
                <option value="">None</option>
                {pastors.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="loc-address">Address</Label>
              <Input
                id="loc-address"
                className="mt-1 h-10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={create.isPending || !name.trim() || !address.trim()}
            onClick={() =>
              create.mutate({
                churchId,
                name,
                address,
                pastorId: pastorId || null,
              })
            }
          >
            {create.isPending ? 'Saving…' : 'Add location'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No locations yet.</p>
        ) : null}
        {list.data?.map((loc) => (
          <Card key={loc.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900 dark:text-white">{loc.name}</p>
                    {loc.source === 'PLANNING_CENTER' ? (
                      <Badge variant="outline" className="text-[10px]">
                        Synced
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{loc.address}</p>
                  {loc.pastor ? (
                    <p className="mt-1 text-xs text-ink-400">
                      Pastor: {loc.pastor.firstName} {loc.pastor.lastName}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextName = window.prompt('Location name', loc.name);
                      const nextAddress = window.prompt('Address', loc.address);
                      if (!nextName || !nextAddress) return;
                      update.mutate({
                        churchId,
                        id: loc.id,
                        name: nextName,
                        address: nextAddress,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Delete ${loc.name}?`)) {
                        remove.mutate({ churchId, id: loc.id });
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                  Weekly services
                </p>
                <ul className="mt-2 space-y-2">
                  {loc.services.map((svc) => (
                    <li
                      key={svc.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-ink-700 dark:text-ink-200">
                        {svc.name} · {DAYS[svc.dayOfWeek]} {svc.startTime}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          deleteService.mutate({
                            churchId,
                            locationId: loc.id,
                            id: svc.id,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-3"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const svcName = window.prompt('Service name', 'Sunday Worship');
                    if (!svcName) return;
                    const dayRaw = window.prompt('Day of week (0=Sun … 6=Sat)', '0');
                    const startTime = window.prompt('Start time (HH:mm)', '10:00');
                    if (dayRaw == null || !startTime) return;
                    createService.mutate({
                      churchId,
                      locationId: loc.id,
                      name: svcName,
                      dayOfWeek: Number(dayRaw),
                      startTime,
                    });
                  }}
                >
                  Add service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function LocationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId, planningCenterLinked }) =>
        planningCenterLinked ? (
          <PcoLockedPanel slug={slug} label="Locations" />
        ) : (
          <LocationsPanel churchId={churchId} />
        )
      }
    </ChurchDashboardProvider>
  );
}
