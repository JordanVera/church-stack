'use client';

import { useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

function PastorsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.pastors.list.useQuery({ churchId });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const create = trpc.pastors.create.useMutation({
    onSuccess: async () => {
      toast.success('Pastor added');
      setFirstName('');
      setLastName('');
      setTitle('');
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.pastors.update.useMutation({
    onSuccess: async () => {
      toast.success('Pastor updated');
      setEditingId(null);
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.pastors.delete.useMutation({
    onSuccess: async () => {
      toast.success('Pastor removed');
      await utils.pastors.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Pastors</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Leadership shown on your site and app. Editable even when Planning Center is linked.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Add pastor</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="fn">First name</Label>
              <Input
                id="fn"
                className="mt-1 h-10"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ln">Last name</Label>
              <Input
                id="ln"
                className="mt-1 h-10"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="mt-1 h-10"
                placeholder="Lead Pastor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={create.isPending || !firstName.trim() || !lastName.trim() || !title.trim()}
            onClick={() => create.mutate({ churchId, firstName, lastName, title })}
          >
            {create.isPending ? 'Saving…' : 'Add pastor'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {list.data?.length === 0 ? (
          <p className="text-sm text-ink-500">No pastors yet.</p>
        ) : null}
        {list.data?.map((p: NonNullable<typeof list.data>[number]) => (
          <Card key={p.id} className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
            <CardContent className="px-5 py-4">
              {editingId === p.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      defaultValue={p.firstName}
                      id={`edit-fn-${p.id}`}
                      placeholder="First name"
                      className="h-10"
                    />
                    <Input
                      defaultValue={p.lastName}
                      id={`edit-ln-${p.id}`}
                      placeholder="Last name"
                      className="h-10"
                    />
                    <Input
                      defaultValue={p.title}
                      id={`edit-title-${p.id}`}
                      placeholder="Title"
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={update.isPending}
                      onClick={() => {
                        const fn = (
                          document.getElementById(`edit-fn-${p.id}`) as HTMLInputElement
                        )?.value;
                        const ln = (
                          document.getElementById(`edit-ln-${p.id}`) as HTMLInputElement
                        )?.value;
                        const t = (
                          document.getElementById(`edit-title-${p.id}`) as HTMLInputElement
                        )?.value;
                        update.mutate({
                          churchId,
                          id: p.id,
                          firstName: fn,
                          lastName: ln,
                          title: t,
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-sm text-ink-500">{p.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(p.id)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`Remove ${p.firstName} ${p.lastName}?`)) {
                          remove.mutate({ churchId, id: p.id });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PastorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <PastorsPanel churchId={churchId} />}
    </ChurchDashboardProvider>
  );
}
