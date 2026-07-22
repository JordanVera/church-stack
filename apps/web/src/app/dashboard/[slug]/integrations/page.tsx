'use client';

import { useState } from 'react';
import Image from 'next/image';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';
const PCO_TOKENS_URL = 'https://api.planningcenteronline.com/personal_access_tokens';

function IntegrationsPanel({
  churchId,
  slug,
  planningCenterLinked,
}: {
  churchId: string;
  slug: string;
  planningCenterLinked: boolean;
}) {
  const utils = trpc.useUtils();
  const [applicationId, setApplicationId] = useState('');
  const [secret, setSecret] = useState('');
  const [assistOpen, setAssistOpen] = useState(false);

  const connect = trpc.church.connectPlanningCenter.useMutation({
    onSuccess: async (data) => {
      toast.success('Planning Center connected', {
        description: data.sync
          ? `Synced ${data.sync.locationsUpserted} campuses, ${data.sync.eventsUpserted} events, ${data.sync.lifeGroupsUpserted} groups.`
          : `${data.campusCount} campus${data.campusCount === 1 ? '' : 'es'} found. Run Sync when ready.`,
      });
      setApplicationId('');
      setSecret('');
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const sync = trpc.church.syncPlanningCenter.useMutation({
    onSuccess: async (data) => {
      toast.success('Sync complete', {
        description: `${data.locationsUpserted} campuses · ${data.eventsUpserted} events · ${data.lifeGroupsUpserted} groups`,
      });
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const disconnect = trpc.church.disconnectPlanningCenter.useMutation({
    onSuccess: async () => {
      toast.success('Planning Center disconnected', {
        description: 'You can now manage locations, events, and groups manually.',
      });
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          Integrations
        </h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Link Planning Center to sync campuses, events, and groups — or keep managing content here.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base">Planning Center</CardTitle>
            <Image
              src="/brand/planning-center-black.png"
              alt=""
              width={120}
              height={28}
              className="h-6 w-auto dark:hidden"
            />
            <Image
              src="/brand/planning-center-white.png"
              alt=""
              width={120}
              height={28}
              className="hidden h-6 w-auto dark:block"
            />
          </div>
          <CardDescription>
            {planningCenterLinked
              ? 'Connected. Locations, events, and life groups are owned by Planning Center.'
              : 'Not connected. Provide a Personal Access Token to sync, or stay on manual CMS.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {planningCenterLinked ? (
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={sync.isPending}
                onClick={() => sync.mutate({ churchId })}
              >
                {sync.isPending ? 'Syncing…' : 'Sync now'}
              </Button>
              <Button
                variant="outline"
                disabled={disconnect.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      'Disconnect Planning Center? You’ll manage locations, events, and groups in Church Stack. Existing synced rows stay until you edit or delete them.'
                    )
                  ) {
                    disconnect.mutate({ churchId });
                  }
                }}
              >
                {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAssistOpen((v) => !v)}>
                Assist with getting keys
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pco-app-id">Application ID</Label>
                  <Input
                    id="pco-app-id"
                    className="mt-1.5 h-10"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="pco-secret">Secret</Label>
                  <Input
                    id="pco-secret"
                    type="password"
                    className="mt-1.5 h-10"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={connect.isPending || !applicationId.trim() || !secret.trim()}
                  onClick={() =>
                    connect.mutate({
                      churchId,
                      applicationId,
                      secret,
                      syncAfterConnect: true,
                    })
                  }
                >
                  {connect.isPending ? 'Connecting…' : 'Connect & sync'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssistOpen((v) => !v)}
                >
                  Assist with getting keys
                </Button>
              </div>
            </div>
          )}

          {assistOpen ? (
            <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50/70 p-4 text-sm leading-relaxed text-ink-600 dark:border-ink-700 dark:bg-ink-950/50 dark:text-ink-300">
              <p className="font-medium text-ink-800 dark:text-ink-100">
                How to find your Application ID &amp; Secret
              </p>
              <ol className="list-decimal space-y-1.5 pl-4">
                <li>
                  Sign in to Planning Center, then open{' '}
                  <a
                    href="https://api.planningcenteronline.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-600 underline dark:text-brand-400"
                  >
                    api.planningcenteronline.com
                  </a>
                  .
                </li>
                <li>
                  Go to{' '}
                  <a
                    href={PCO_TOKENS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-600 underline dark:text-brand-400"
                  >
                    Personal Access Tokens
                  </a>{' '}
                  (not “OAuth Applications”).
                </li>
                <li>
                  Click{' '}
                  <span className="font-medium text-ink-800 dark:text-ink-100">
                    New personal access token
                  </span>
                  . Name it e.g. “Church Stack”.
                </li>
                <li>
                  Copy the{' '}
                  <span className="font-medium text-ink-800 dark:text-ink-100">Application ID</span>{' '}
                  and <span className="font-medium text-ink-800 dark:text-ink-100">Secret</span> into
                  the fields above. The secret is shown only once.
                </li>
              </ol>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Help me get Planning Center keys')}`}
                className="inline-flex font-semibold text-brand-600 dark:text-brand-400"
              >
                Email us for help getting keys
              </a>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntegrationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId, planningCenterLinked }) => (
        <IntegrationsPanel
          churchId={churchId}
          slug={slug}
          planningCenterLinked={planningCenterLinked}
        />
      )}
    </ChurchDashboardProvider>
  );
}
