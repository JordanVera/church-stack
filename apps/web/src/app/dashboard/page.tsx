'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { PLAN_TIERS, planAllowsGiving, type PlanTierId } from '@repo/config';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

type MembershipChurch = {
  id: string;
  slug: string;
  name: string;
  planTier: PlanTierId | string;
  websiteStatus: string;
  websiteUrl: string | null;
  givingUrl: string | null;
  customDomain: string | null;
  mobilePlan: string;
  mobileBuildStatus: string;
};

function websiteStatusCopy(status: string) {
  switch (status) {
    case 'LIVE':
      return 'Your site is live.';
    case 'PENDING':
    case 'DEPLOYING':
      return 'We’re provisioning your white-label site. This usually finishes within a day.';
    case 'FAILED':
      return 'Site provisioning hit a snag — we’ve been notified and will follow up.';
    default:
      return 'We’ll set up your white-label site next and email your admin contacts when it’s ready.';
  }
}

function ChurchOwnerCard({
  role,
  church,
}: {
  role: string;
  church: MembershipChurch;
}) {
  const utils = trpc.useUtils();
  const [givingUrl, setGivingUrl] = useState(church.givingUrl ?? '');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setGivingUrl(church.givingUrl ?? '');
  }, [church.givingUrl]);

  const planTier =
    church.planTier === 'SITE' || church.planTier === 'GROWTH' || church.planTier === 'CUSTOM'
      ? church.planTier
      : 'SITE';
  const plan = PLAN_TIERS[planTier];
  const canEditGiving = planAllowsGiving(planTier);

  const portal = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => setMessage(err.message),
  });

  const saveGiving = trpc.church.ownerUpdateGivingUrl.useMutation({
    onSuccess: async () => {
      setMessage('Giving link saved.');
      await utils.auth.me.invalidate();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <Card className="border-ink-200 shadow-sm dark:border-ink-800 dark:bg-ink-900">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-semibold text-ink-900 dark:text-white">
            {church.name}
          </CardTitle>
          <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {role}
          </Badge>
        </div>
        <CardDescription className="text-ink-500 dark:text-ink-400">
          /{church.slug} · {plan.name} ({plan.priceLabel}
          {plan.period})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
            Website
          </p>
          <p className="mt-1 text-sm text-ink-700 dark:text-ink-300">
            Status: <span className="font-medium">{church.websiteStatus}</span>
          </p>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
            {websiteStatusCopy(church.websiteStatus)}
          </p>
          {church.websiteUrl ? (
            <a
              href={church.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-brand-600 dark:text-brand-400"
            >
              Open site
            </a>
          ) : null}
          {church.customDomain ? (
            <p className="mt-1 text-xs text-ink-500">Custom domain: {church.customDomain}</p>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-400 uppercase">
            Mobile
          </p>
          <p className="mt-1 text-sm text-ink-700 dark:text-ink-300">
            {church.mobilePlan} · build {church.mobileBuildStatus}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-ink-300 text-sm"
            disabled={portal.isPending}
            onClick={() => {
              setMessage(null);
              portal.mutate({
                churchId: church.id,
                returnUrl: `${window.location.origin}/dashboard`,
              });
            }}
          >
            {portal.isPending ? 'Opening…' : 'Manage billing'}
          </Button>
          <Button
            variant="outline"
            className="border-ink-300 text-sm"
            render={
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${church.name} support`)}`}
              />
            }
          >
            Contact support
          </Button>
        </div>

        {canEditGiving ? (
          <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
            <Label htmlFor={`giving-${church.id}`} className="text-ink-700 dark:text-ink-300">
              Giving link
            </Label>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              Tithe.ly, Pushpay, or another external URL. Leave blank to hide Give on your site.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                id={`giving-${church.id}`}
                type="url"
                placeholder="https://…"
                value={givingUrl}
                onChange={(e) => setGivingUrl(e.target.value)}
                className="h-10"
              />
              <Button
                type="button"
                className="h-10 shrink-0"
                disabled={saveGiving.isPending}
                onClick={() => {
                  setMessage(null);
                  saveGiving.mutate({
                    churchId: church.id,
                    givingUrl: givingUrl.trim() || null,
                  });
                }}
              >
                {saveGiving.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        ) : null}

        {message ? (
          <p className="text-sm text-ink-600 dark:text-ink-300">{message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const me = trpc.auth.me.useQuery(undefined, { enabled: status === 'authenticated' });

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
          Sign in to see your church status, billing, and site link.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="h-11 px-5" render={<Link href="/login?callbackUrl=/dashboard" />}>
            Sign in
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5"
            render={<Link href="/pricing" />}
          >
            Register a church
          </Button>
        </div>
      </div>
    );
  }

  const isStaff = Boolean(me.data?.isAdmin || me.data?.isDev);
  const memberships = me.data?.memberships ?? [];

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
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            {isStaff && memberships.length === 0 ? 'Dashboard' : 'Your church'}
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">Signed in as {me.data?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {me.data?.isDev ? (
            <Button
              variant="outline"
              className="border-ink-300 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800"
              render={<Link href="/dev" />}
            >
              Dev
            </Button>
          ) : null}
          {me.data?.isAdmin ? (
            <Button
              variant="outline"
              className="border-ink-300 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800"
              render={<Link href="/admin" />}
            >
              Admin
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="border-ink-300 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800"
          >
            Sign out
          </Button>
        </div>
      </div>

      {memberships.length > 0 ? (
        <>
          <h2 className="mt-10 text-lg font-semibold text-ink-900 dark:text-white">
            {memberships.length === 1 ? 'Church' : 'Your churches'}
          </h2>
          <div className="mt-4 grid gap-4">
            {memberships.map((m) => (
              <ChurchOwnerCard
                key={m.church.id}
                role={m.role}
                church={m.church as MembershipChurch}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-10 text-sm text-ink-600 dark:text-ink-300">
          No church memberships on this staff account. Use Dev or Admin to manage tenants.
        </p>
      )}
    </div>
  );
}
