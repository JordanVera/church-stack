'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const { status } = useSession();
  const me = trpc.auth.me.useQuery(undefined, { enabled: status === 'authenticated' });

  if (status === 'loading') {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-ink-600 dark:text-ink-300">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">You’re signed out</h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          Please{' '}
          <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-400">
            log in
          </Link>{' '}
          to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">Signed in as {me.data?.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="border-ink-300 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800"
        >
          Sign out
        </Button>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink-900 dark:text-white">Your churches</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {me.data?.memberships.length ? (
          me.data.memberships.map((m) => (
            <Card
              key={m.church.id}
              className="border-ink-200 shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <CardHeader className="px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold text-ink-900 dark:text-white">
                    {m.church.name}
                  </CardTitle>
                  <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {m.role}
                  </Badge>
                </div>
                <CardDescription className="text-ink-500 dark:text-ink-400">
                  /{m.church.slug}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-sm text-ink-600 dark:text-ink-300">You’re not part of any church yet.</p>
        )}
      </div>
    </div>
  );
}
