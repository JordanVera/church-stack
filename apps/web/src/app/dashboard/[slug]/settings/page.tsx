'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

function SettingsPanel({
  churchId,
  slug,
}: {
  churchId: string;
  slug: string;
}) {
  const utils = trpc.useUtils();
  const dash = trpc.church.getOwnerDashboard.useQuery({ slug });
  const [givingUrl, setGivingUrl] = useState('');

  useEffect(() => {
    setGivingUrl(dash.data?.givingUrl ?? '');
  }, [dash.data?.givingUrl]);

  const portal = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  const saveGiving = trpc.church.ownerUpdateGivingUrl.useMutation({
    onSuccess: async () => {
      toast.success('Giving link saved');
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const data = dash.data;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Billing, giving link, and support.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>Update payment method or cancel via Stripe Customer Portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            disabled={portal.isPending}
            onClick={() =>
              portal.mutate({
                churchId,
                returnUrl: `${window.location.origin}/dashboard/${slug}/settings`,
              })
            }
          >
            {portal.isPending ? 'Opening…' : 'Manage billing'}
          </Button>
        </CardContent>
      </Card>

      {data.canEditGiving ? (
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader>
            <CardTitle className="text-base">Giving link</CardTitle>
            <CardDescription>
              Tithe.ly, Pushpay, or another external URL. Leave blank to hide Give on your site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="giving">URL</Label>
              <Input
                id="giving"
                type="url"
                className="mt-1 h-10"
                placeholder="https://…"
                value={givingUrl}
                onChange={(e) => setGivingUrl(e.target.value)}
              />
            </div>
            <Button
              disabled={saveGiving.isPending}
              onClick={() =>
                saveGiving.mutate({
                  churchId,
                  givingUrl: givingUrl.trim() || null,
                })
              }
            >
              {saveGiving.isPending ? 'Saving…' : 'Save giving link'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
          <CardHeader>
            <CardTitle className="text-base">Giving link</CardTitle>
            <CardDescription>
              Giving URL is available on Growth and Custom plans.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Support</CardTitle>
          <CardDescription>Questions about your site, apps, or Planning Center?</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            render={
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${data.name} support`)}`}
              />
            }
          >
            Contact support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <ChurchDashboardProvider slug={slug}>
      {({ churchId }) => <SettingsPanel churchId={churchId} slug={slug} />}
    </ChurchDashboardProvider>
  );
}
