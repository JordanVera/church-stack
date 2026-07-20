'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevPage() {
  const utils = trpc.useUtils();
  const churches = trpc.church.adminList.useQuery();
  const create = trpc.church.create.useMutation({
    onSuccess: async () => {
      setSlug('');
      setName('');
      setTagline('');
      setOwnerEmail('');
      await utils.church.adminList.invalidate();
    },
  });

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
            Engineer
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Dev console
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">
            Provision churches, websites, and white-label mobile builds.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          ← Back to dashboard
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Create church</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({
              slug: slug.trim().toLowerCase(),
              name: name.trim(),
              tagline: tagline.trim() || null,
              ownerEmail: ownerEmail.trim() || null,
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="grace"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grace Community Church"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A place to belong"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner email (optional)</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={create.isPending} className="bg-brand-600 text-white">
              {create.isPending ? 'Creating…' : 'Create church'}
            </Button>
            {create.error ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{create.error.message}</p>
            ) : null}
            {create.isSuccess ? (
              <p className="mt-2 text-sm text-brand-700 dark:text-brand-300">
                Created{' '}
                <Link
                  href={`/dev/churches/${create.data.slug}`}
                  className="font-medium underline"
                >
                  {create.data.name}
                </Link>
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Churches</h2>
        {churches.isLoading ? (
          <p className="mt-4 text-sm text-ink-600 dark:text-ink-300">Loading…</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {churches.data?.map((church: (typeof churches.data)[number]) => (
              <Link key={church.id} href={`/dev/churches/${church.slug}`}>
                <Card className="border-ink-200 shadow-sm transition-colors hover:border-brand-400 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-500">
                  <CardHeader className="px-5">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="font-semibold text-ink-900 dark:text-white">
                        {church.name}
                      </CardTitle>
                      <Badge
                        className={
                          church.isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
                        }
                      >
                        {church.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription className="text-ink-500 dark:text-ink-400">
                      /{church.slug} · {church._count.memberships} members · site{' '}
                      {church.websiteStatus} · mobile {church.mobilePlan}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
