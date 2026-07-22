'use client';

import Link from 'next/link';
import { use } from 'react';
import { PLAN_TIERS, type PlanTierId } from '@repo/config';
import { trpc } from '@/lib/trpc-client';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

function Overview({ slug }: { slug: string }) {
  const dash = trpc.church.getOwnerDashboard.useQuery({ slug });
  const data = dash.data;
  if (!data) return null;

  const planTier =
    data.planTier === 'SITE' || data.planTier === 'GROWTH' || data.planTier === 'CUSTOM'
      ? (data.planTier as PlanTierId)
      : 'SITE';
  const plan = PLAN_TIERS[planTier];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Overview</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          {plan.name} · {plan.priceLabel}
          {plan.period}
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Content mode</CardTitle>
          <CardDescription>
            {data.planningCenterLinked
              ? 'Locations, events, and life groups sync from Planning Center. Pastors and announcements stay editable here.'
              : 'You’re managing content in Church Stack. Connect Planning Center anytime if you prefer to sync.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {data.planningCenterLinked ? (
            <Button render={<Link href={`/dashboard/${slug}/integrations`} />}>
              Sync Planning Center
            </Button>
          ) : (
            <>
              <Button render={<Link href={`/dashboard/${slug}/locations`} />}>
                Manage your content
              </Button>
              <Button
                variant="outline"
                render={<Link href={`/dashboard/${slug}/integrations`} />}
              >
                Connect Planning Center
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Pastors', count: data.counts.pastors, href: `/dashboard/${slug}/pastors` },
          {
            label: 'Locations',
            count: data.counts.locations,
            href: `/dashboard/${slug}/locations`,
          },
          { label: 'Events', count: data.counts.events, href: `/dashboard/${slug}/events` },
          {
            label: 'Announcements',
            count: data.counts.announcements,
            href: `/dashboard/${slug}/announcements`,
          },
          {
            label: 'Life groups',
            count: data.counts.lifeGroups,
            href: `/dashboard/${slug}/groups`,
          },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Card className="h-full border-ink-200 transition hover:border-brand-300 dark:border-ink-800 dark:hover:border-brand-700">
              <CardContent className="px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-ink-900 dark:text-white">
                  {item.count}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader>
            <CardTitle className="text-base">Website</CardTitle>
            <CardDescription>{websiteStatusCopy(data.websiteStatus)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Status: <span className="font-medium">{data.websiteStatus}</span>
            </p>
            {data.websiteUrl ? (
              <a
                href={data.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 dark:text-brand-400"
              >
                Open site
              </a>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader>
            <CardTitle className="text-base">Mobile</CardTitle>
            <CardDescription>
              {data.mobilePlan} · build {data.mobileBuildStatus}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link href={`/dashboard/${slug}/settings`} />}>
              Billing & settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ChurchOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {() => <Overview slug={slug} />}
    </ChurchDashboardProvider>
  );
}
