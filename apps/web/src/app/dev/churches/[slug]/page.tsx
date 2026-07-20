'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevChurchDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const utils = trpc.useUtils();
  const churchQuery = trpc.church.adminGetBySlug.useQuery({ slug });

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a8bbd');
  const [secondaryColor, setSecondaryColor] = useState('#84dccf');
  const [contactEmail, setContactEmail] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [planningCenterApiKey, setPlanningCenterApiKey] = useState('');
  const [planningCenterSecretKey, setPlanningCenterSecretKey] = useState('');
  const [planTier, setPlanTier] = useState<'SITE' | 'GROWTH' | 'CUSTOM'>('SITE');
  const [givingEnabled, setGivingEnabled] = useState(false);
  const [eventsEnabled, setEventsEnabled] = useState(true);
  const [sermonsEnabled, setSermonsEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const c = churchQuery.data;
    if (!c) return;
    setName(c.name);
    setTagline(c.tagline ?? '');
    setPrimaryColor(c.primaryColor);
    setSecondaryColor(c.secondaryColor);
    setContactEmail(c.contactEmail ?? '');
    setCustomDomain(c.customDomain ?? '');
    setPlanningCenterApiKey(c.planningCenterApiKey ?? '');
    setPlanningCenterSecretKey(c.planningCenterSecretKey ?? '');
    setPlanTier(c.planTier);
    setGivingEnabled(c.givingEnabled);
    setEventsEnabled(c.eventsEnabled);
    setSermonsEnabled(c.sermonsEnabled);
    setIsActive(c.isActive);
  }, [churchQuery.data]);

  const update = trpc.church.update.useMutation({
    onSuccess: async () => {
      setActionMessage('Saved.');
      await utils.church.adminGetBySlug.invalidate({ slug });
      await utils.church.adminList.invalidate();
    },
  });

  const provision = trpc.church.provisionWebsite.useMutation({
    onSuccess: async (result) => {
      const domainNote =
        result.domainVerification != null
          ? `\nDomain: ${result.domainVerification.ok ? 'attached' : 'failed'} — ${
              result.domainVerification.error ??
              (result.domainVerification.verified ? 'verified' : 'pending DNS')
            }`
          : '';
      setActionMessage(
        result.ok
          ? `Website provisioned: ${result.url}${domainNote}`
          : `Provision failed: ${result.error}`
      );
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
  });

  const attachDomain = trpc.church.attachCustomDomain.useMutation({
    onSuccess: async (result) => {
      const dns = result.dns?.map((d) => `${d.type} ${d.name} → ${d.value}`).join('\n') ?? '';
      setActionMessage(
        result.ok
          ? `Domain ${result.domain} attached${result.verified ? ' (verified)' : ' (awaiting DNS)'}.${
              dns ? `\n\nDNS records:\n${dns}` : ''
            }`
          : `Domain attach failed: ${result.error}`
      );
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
  });

  const setProductPlan = trpc.church.setPlanTier.useMutation({
    onSuccess: async () => {
      setActionMessage('Plan tier updated (feature flags applied).');
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
  });

  const createCheckout = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      setActionMessage(`Checkout failed: ${err.message}`);
    },
  });

  const createPortal = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => {
      setActionMessage(`Portal failed: ${err.message}`);
    },
  });

  const syncPco = trpc.church.syncPlanningCenter.useMutation({
    onSuccess: async (result) => {
      setActionMessage(
        `Planning Center sync complete: ${result.locationsUpserted} locations, ${result.servicesUpserted} services, ${result.eventsUpserted} events, ${result.lifeGroupsUpserted} life groups.`
      );
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
    onError: (err) => {
      setActionMessage(`Planning Center sync failed: ${err.message}`);
    },
  });

  const setPlan = trpc.church.setMobilePlan.useMutation({
    onSuccess: async () => {
      setActionMessage('Mobile plan updated.');
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
  });

  const queueBuild = trpc.church.queueWhiteLabelBuild.useMutation({
    onSuccess: async (result) => {
      const parts = [
        result.ok ? 'White-label build queued.' : `Queue issue: ${result.error}`,
        result.manualCommand ? `\n\nManual command:\n${result.manualCommand}` : '',
      ];
      setActionMessage(parts.join(''));
      await utils.church.adminGetBySlug.invalidate({ slug });
    },
  });

  if (churchQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-ink-600 dark:text-ink-300">Loading…</div>
    );
  }

  if (churchQuery.error || !churchQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-ink-600 dark:text-ink-300">Church not found.</p>
        <Link href="/dev" className="mt-4 inline-block text-brand-600 hover:underline">
          ← Back
        </Link>
      </div>
    );
  }

  const church = churchQuery.data;
  const previewUrl = process.env.NEXT_PUBLIC_CHURCH_SITE_PREVIEW_URL ?? `http://localhost:3001`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dev"
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            ← Dev console
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            {church.name}
          </h1>
          <p className="mt-1 text-ink-600 dark:text-ink-300">/{church.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            plan {church.planTier}
          </Badge>
          <Badge className="bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            site {church.websiteStatus}
          </Badge>
          <Badge className="bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            mobile {church.mobilePlan}
          </Badge>
          <Badge className="bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            build {church.mobileBuildStatus}
          </Badge>
        </div>
      </div>

      {actionMessage ? (
        <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm text-ink-800 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200">
          {actionMessage}
        </pre>
      ) : null}

      <form
        className="mt-10 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({
            id: church.id,
            name: name.trim(),
            tagline: tagline.trim() || null,
            primaryColor,
            secondaryColor,
            contactEmail: contactEmail.trim() || null,
            customDomain: customDomain.trim() || null,
            planningCenterApiKey: planningCenterApiKey.trim() || null,
            planningCenterSecretKey: planningCenterSecretKey.trim() || null,
            planTier,
            givingEnabled,
            eventsEnabled,
            sermonsEnabled,
            isActive,
          });
        }}
      >
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Branding & flags</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="planTier">Product plan</Label>
            <select
              id="planTier"
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as 'SITE' | 'GROWTH' | 'CUSTOM')}
              className="flex h-10 w-full rounded-md border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900"
            >
              <option value="SITE">Site ($129)</option>
              <option value="GROWTH">Growth ($249)</option>
              <option value="CUSTOM">Custom (from $599)</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary">Primary color</Label>
            <Input
              id="primary"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary">Secondary color</Label>
            <Input
              id="secondary"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Custom domain</Label>
            <Input
              id="domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="www.grace.church"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcApiKey">Planning Center API key</Label>
            <Input
              id="pcApiKey"
              value={planningCenterApiKey}
              onChange={(e) => setPlanningCenterApiKey(e.target.value)}
              placeholder="Application ID / API key"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcSecret">Planning Center secret</Label>
            <Input
              id="pcSecret"
              type="password"
              value={planningCenterSecretKey}
              onChange={(e) => setPlanningCenterSecretKey(e.target.value)}
              placeholder="Secret"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-ink-700 dark:text-ink-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={givingEnabled}
              onChange={(e) => setGivingEnabled(e.target.checked)}
            />
            Giving
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={eventsEnabled}
              onChange={(e) => setEventsEnabled(e.target.checked)}
            />
            Events
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sermonsEnabled}
              onChange={(e) => setSermonsEnabled(e.target.checked)}
            />
            Sermons
          </label>
        </div>

        <Button type="submit" disabled={update.isPending} className="w-fit bg-brand-600 text-white">
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <div className="mt-12 grid gap-4">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Website</h2>
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardTitle className="text-base text-ink-900 dark:text-white">
              Vercel provision
            </CardTitle>
            <CardDescription className="text-ink-500 dark:text-ink-400">
              {church.websiteUrl ? (
                <>
                  Live at{' '}
                  <a
                    href={church.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 underline dark:text-brand-400"
                  >
                    {church.websiteUrl}
                  </a>
                </>
              ) : (
                'No website URL yet. Provision creates a Vercel project for apps/church-site.'
              )}
              {church.vercelProjectId ? (
                <span className="mt-1 block">Project: {church.vercelProjectId}</span>
              ) : null}
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={provision.isPending}
                onClick={() => provision.mutate({ churchId: church.id })}
                className="bg-brand-600 text-white"
              >
                {provision.isPending ? 'Provisioning…' : 'Provision / redeploy'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={attachDomain.isPending || !church.customDomain}
                className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                onClick={() => attachDomain.mutate({ churchId: church.id })}
              >
                {attachDomain.isPending ? 'Attaching…' : 'Attach custom domain'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                render={
                  <a href={`${previewUrl}?slug=${church.slug}`} target="_blank" rel="noreferrer" />
                }
              >
                Local preview
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-12 grid gap-4">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Billing</h2>
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardTitle className="text-base text-ink-900 dark:text-white">Stripe</CardTitle>
            <CardDescription className="text-ink-500 dark:text-ink-400">
              Start Checkout for a tier, or open the Customer Portal when a Stripe customer exists.
              {church.stripeCustomerId ? (
                <span className="mt-1 block">Customer: {church.stripeCustomerId}</span>
              ) : null}
              {church.stripeSubscriptionId ? (
                <span className="mt-1 block">Subscription: {church.stripeSubscriptionId}</span>
              ) : null}
              {church.stripePriceId ? (
                <span className="mt-1 block">Price: {church.stripePriceId}</span>
              ) : null}
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['SITE', 'GROWTH', 'CUSTOM'] as const).map((tier) => (
                <Button
                  key={tier}
                  type="button"
                  variant="outline"
                  disabled={createCheckout.isPending}
                  className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                  onClick={() => {
                    const origin = window.location.origin;
                    createCheckout.mutate({
                      churchId: church.id,
                      planTier: tier,
                      successUrl: `${origin}/billing/success?churchId=${encodeURIComponent(church.id)}`,
                      cancelUrl: `${origin}/dev/churches/${church.slug}`,
                    });
                  }}
                >
                  Checkout {tier}
                </Button>
              ))}
              <Button
                type="button"
                disabled={createPortal.isPending || !church.stripeCustomerId}
                className="bg-brand-600 text-white"
                onClick={() => {
                  createPortal.mutate({
                    churchId: church.id,
                    returnUrl: `${window.location.origin}/dev/churches/${church.slug}`,
                  });
                }}
              >
                {createPortal.isPending ? 'Opening…' : 'Manage billing'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-12 grid gap-4">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Plan & sync</h2>
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardTitle className="text-base text-ink-900 dark:text-white">
              Product tier & Planning Center
            </CardTitle>
            <CardDescription className="text-ink-500 dark:text-ink-400">
              Manual comps / offline deals: apply Site / Growth / Custom feature gates without Stripe.
              Or pull locations, events, and life groups from Planning Center into the shared DB.
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['SITE', 'GROWTH', 'CUSTOM'] as const).map((tier) => (
                <Button
                  key={tier}
                  type="button"
                  variant="outline"
                  disabled={setProductPlan.isPending}
                  className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                  onClick={() => setProductPlan.mutate({ churchId: church.id, planTier: tier })}
                >
                  Set {tier}
                </Button>
              ))}
              <Button
                type="button"
                disabled={syncPco.isPending}
                onClick={() => syncPco.mutate({ churchId: church.id })}
                className="bg-brand-600 text-white"
              >
                {syncPco.isPending ? 'Syncing…' : 'Sync Planning Center'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-12 grid gap-4">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Mobile</h2>
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader className="px-5">
            <CardTitle className="text-base text-ink-900 dark:text-white">Hybrid plan</CardTitle>
            <CardDescription className="text-ink-500 dark:text-ink-400">
              SHARED = Church Stack store app with picker. WHITELABEL = paid per-church EAS build.
            </CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={setPlan.isPending}
                className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                onClick={() => setPlan.mutate({ churchId: church.id, plan: 'SHARED' })}
              >
                Set SHARED
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={setPlan.isPending}
                className="border-ink-300 dark:border-ink-700 dark:bg-transparent"
                onClick={() => setPlan.mutate({ churchId: church.id, plan: 'WHITELABEL' })}
              >
                Set WHITELABEL
              </Button>
              <Button
                type="button"
                disabled={queueBuild.isPending}
                onClick={() => queueBuild.mutate({ churchId: church.id })}
                className="bg-brand-600 text-white"
              >
                {queueBuild.isPending ? 'Queuing…' : 'Queue white-label build'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
