'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';
import { DashboardShell } from './DashboardShell';

export function ChurchDashboardProvider({
  slug,
  children,
}: {
  slug: string;
  children: (data: {
    churchId: string;
    slug: string;
    planningCenterLinked: boolean;
  }) => React.ReactNode;
}) {
  const { status } = useSession();
  const dash = trpc.church.getOwnerDashboard.useQuery(
    { slug },
    { enabled: status === 'authenticated' }
  );

  if (status === 'loading' || (status === 'authenticated' && dash.isLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-ink-600 dark:text-ink-300">Loading…</div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-ink-600 dark:text-ink-300">Sign in to manage this church.</p>
      </div>
    );
  }

  if (dash.error || !dash.data) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-ink-900 dark:text-white">
          {dash.error?.message ?? 'Church not found or you do not have access.'}
        </p>
      </div>
    );
  }

  const data = dash.data;

  return (
    <DashboardShell
      slug={data.slug}
      churchName={data.name}
      planningCenterLinked={data.planningCenterLinked}
    >
      {children({
        churchId: data.id,
        slug: data.slug,
        planningCenterLinked: data.planningCenterLinked,
      })}
    </DashboardShell>
  );
}
