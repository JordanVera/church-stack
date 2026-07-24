'use client';

import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function VisitsPanel({ churchId }: { churchId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.visitPlans.list.useQuery({ churchId });

  const remove = trpc.visitPlans.delete.useMutation({
    onSuccess: async () => {
      toast.success('Visit plan removed');
      await utils.visitPlans.list.invalidate({ churchId });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Planned visits
        </h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Guests who submitted the Plan a visit form on your white-label site.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardContent className="px-5 py-5">
          {list.isLoading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : !list.data?.length ? (
            <p className="text-sm text-ink-500">No planned visits yet.</p>
          ) : (
            <ul className="divide-y divide-ink-200 dark:divide-ink-800">
              {list.data.map((v: (typeof list.data)[number]) => {
                const visitDay = new Date(v.visitDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC',
                });
                return (
                  <li
                    key={v.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 dark:text-white">
                        {v.firstName} {v.lastName}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-600 dark:text-ink-300">
                        {v.email}
                        {v.phone ? ` · ${v.phone}` : ''}
                      </p>
                      <p className="mt-2 text-sm font-medium text-brand-700 dark:text-brand-300">
                        {visitDay}
                        {v.locationName ? ` · ${v.locationName}` : ''}
                        {v.serviceName ? ` · ${v.serviceName}` : ''}
                      </p>
                      {v.notes ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600 dark:text-ink-300">
                          {v.notes}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate({ churchId, id: v.id })}
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VisitsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <VisitsPanel churchId={churchId} />}
    </ChurchDashboardProvider>
  );
}
