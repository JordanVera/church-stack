'use client';

import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  WEBSITE: 'Website',
  MOBILE: 'Mobile',
  PLANNING_CENTER: 'Planning Center',
  BILLING: 'Billing',
  OTHER: 'Other',
};

export function AdminSupportRequests() {
  const utils = trpc.useUtils();
  const openCount = trpc.support.adminOpenCount.useQuery();
  const list = trpc.support.adminList.useQuery({ status: 'OPEN', take: 50 });

  const resolve = trpc.support.adminResolve.useMutation({
    onSuccess: async () => {
      toast.success('Marked resolved');
      await Promise.all([
        utils.support.adminList.invalidate(),
        utils.support.adminOpenCount.invalidate(),
      ]);
    },
    onError: (err) => toast.error(err.message),
  });

  const reopen = trpc.support.adminReopen.useMutation({
    onSuccess: async () => {
      toast.success('Reopened');
      await Promise.all([
        utils.support.adminList.invalidate(),
        utils.support.adminOpenCount.invalidate(),
      ]);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Support requests</h2>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
            Messages from church owners via the dashboard contact form.
          </p>
        </div>
        {openCount.data != null ? (
          <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {openCount.data} open
          </Badge>
        ) : null}
      </div>

      <Card className="mt-4 border-ink-200 shadow-sm dark:border-ink-800 dark:bg-ink-900">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Open requests</CardTitle>
          <CardDescription>
            Notifications are emailed to the platform support inbox when submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {list.isLoading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : !list.data?.length ? (
            <p className="text-sm text-ink-500">No open support requests.</p>
          ) : (
            <ul className="divide-y divide-ink-200 dark:divide-ink-800">
              {list.data.map((item: (typeof list.data)[number]) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900 dark:text-white">{item.subject}</p>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      {item.churchName}{' '}
                      <span className="text-ink-400">/{item.churchSlug}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {item.userName ? `${item.userName} · ` : ''}
                      {item.userEmail} · {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700 dark:text-ink-300">
                      {item.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {item.status === 'OPEN' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resolve.isPending}
                        onClick={() => resolve.mutate({ id: item.id })}
                      >
                        Mark resolved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={reopen.isPending}
                        onClick={() => reopen.mutate({ id: item.id })}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
