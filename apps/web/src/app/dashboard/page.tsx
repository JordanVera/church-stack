'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc-client';

export default function DashboardPage() {
  const { status } = useSession();
  const me = trpc.auth.me.useQuery(undefined, { enabled: status === 'authenticated' });

  if (status === 'loading') {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-slate-600 dark:text-slate-300">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">You’re signed out</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Please{' '}
          <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Signed in as {me.data?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900 dark:text-white">Your churches</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {me.data?.memberships.length ? (
          me.data.memberships.map((m) => (
            <div
              key={m.church.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">{m.church.name}</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {m.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">/{m.church.slug}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">You’re not part of any church yet.</p>
        )}
      </div>
    </div>
  );
}
