'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { status } = useSession();
  const me = trpc.auth.me.useQuery(undefined, { enabled: status === 'authenticated' });

  const memberships = me.data?.memberships ?? [];
  const isStaff = Boolean(me.data?.isAdmin || me.data?.isDev);

  useEffect(() => {
    if (status !== 'authenticated' || me.isLoading) return;
    if (memberships.length === 1 && memberships[0]) {
      router.replace(`/dashboard/${memberships[0].church.slug}`);
    }
  }, [status, me.isLoading, memberships, router]);

  if (status === 'loading' || (status === 'authenticated' && me.isLoading)) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-ink-600 dark:text-ink-300">Loading…</div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
          Church home
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          Sign in to manage your church content, integrations, and billing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="h-11 px-5" render={<Link href="/login?callbackUrl=/dashboard" />}>
            Sign in
          </Button>
          <Button variant="outline" className="h-11 px-5" render={<Link href="/pricing" />}>
            Register a church
          </Button>
        </div>
      </div>
    );
  }

  if (!isStaff && memberships.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">No church yet</h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">
          This account isn’t linked to a church.{' '}
          <Link href="/pricing" className="font-semibold text-brand-600 dark:text-brand-400">
            Start church signup
          </Link>
          .
        </p>
        <Button className="mt-6" variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
          Sign out
        </Button>
      </div>
    );
  }

  if (memberships.length === 1) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-ink-600 dark:text-ink-300">
        Opening your church…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Your churches
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">Signed in as {me.data?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {me.data?.isDev ? (
            <Button variant="outline" className="border-ink-300 text-sm" render={<Link href="/dev" />}>
              Dev
            </Button>
          ) : null}
          {me.data?.isAdmin ? (
            <Button
              variant="outline"
              className="border-ink-300 text-sm"
              render={<Link href="/admin" />}
            >
              Admin
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="border-ink-300 text-sm"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign out
          </Button>
        </div>
      </div>

      {memberships.length > 0 ? (
        <div className="mt-10 grid gap-4">
          {memberships.map((m) => (
            <Card
              key={m.church.id}
              className="border-ink-200 shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <CardHeader className="px-5">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-semibold text-ink-900 dark:text-white">
                    {m.church.name}
                  </CardTitle>
                  <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {m.role}
                  </Badge>
                </div>
                <CardDescription>/{m.church.slug}</CardDescription>
              </CardHeader>
              <CardContent className="px-5">
                <Button render={<Link href={`/dashboard/${m.church.slug}`} />}>Open dashboard</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-ink-600 dark:text-ink-300">
          No church memberships on this staff account. Use Dev or Admin to manage tenants.
        </p>
      )}
    </div>
  );
}
