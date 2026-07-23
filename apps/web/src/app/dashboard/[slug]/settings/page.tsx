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
const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizeHex(value: string) {
  const v = value.trim();
  if (!v) return '';
  return v.startsWith('#') ? v : `#${v}`;
}

/** Expand #abc → #aabbcc for `<input type="color">`. */
function toColorInputValue(hex: string, fallback: string) {
  if (!HEX_COLOR.test(hex)) return fallback;
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function SettingsPanel({ churchId, slug }: { churchId: string; slug: string }) {
  const utils = trpc.useUtils();
  const dash = trpc.church.getOwnerDashboard.useQuery({ slug });
  const [givingUrl, setGivingUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a8bbd');
  const [secondaryColor, setSecondaryColor] = useState('#84dccf');

  useEffect(() => {
    setGivingUrl(dash.data?.givingUrl ?? '');
  }, [dash.data?.givingUrl]);

  useEffect(() => {
    if (dash.data?.primaryColor) setPrimaryColor(dash.data.primaryColor);
    if (dash.data?.secondaryColor) setSecondaryColor(dash.data.secondaryColor);
  }, [dash.data?.primaryColor, dash.data?.secondaryColor]);

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

  const saveColors = trpc.church.ownerUpdateBrandingColors.useMutation({
    onSuccess: async () => {
      toast.success('Brand colors saved');
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const data = dash.data;
  if (!data) return null;

  const primaryValid = HEX_COLOR.test(primaryColor);
  const secondaryValid = HEX_COLOR.test(secondaryColor);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Branding, billing, giving link, and support.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Brand colors</CardTitle>
          <CardDescription>
            Primary and secondary colors power your white-label site hero and accents. Use hex
            values like #1a8bbd.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primary-color">Primary</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="primary-color-picker"
                  type="color"
                  value={toColorInputValue(primaryColor, '#1a8bbd')}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-ink-200 bg-transparent p-1 dark:border-ink-700"
                  aria-label="Pick primary color"
                />
                <Input
                  id="primary-color"
                  className="h-10 font-mono text-sm"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(normalizeHex(e.target.value))}
                  placeholder="#1a8bbd"
                />
              </div>
              {!primaryValid && primaryColor ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Enter a valid hex color.
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="secondary-color-picker"
                  type="color"
                  value={toColorInputValue(secondaryColor, '#84dccf')}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-ink-200 bg-transparent p-1 dark:border-ink-700"
                  aria-label="Pick secondary color"
                />
                <Input
                  id="secondary-color"
                  className="h-10 font-mono text-sm"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(normalizeHex(e.target.value))}
                  placeholder="#84dccf"
                />
              </div>
              {!secondaryValid && secondaryColor ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Enter a valid hex color.
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="overflow-hidden rounded-xl px-5 py-6 text-white"
            style={{
              background: `linear-gradient(145deg, ${primaryValid ? primaryColor : '#1a8bbd'} 0%, ${
                secondaryValid ? secondaryColor : '#84dccf'
              } 120%)`,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Preview
            </p>
            <p className="mt-2 font-display text-xl font-semibold">{data.name}</p>
            <span
              className="mt-4 inline-flex rounded-md px-3 py-1.5 text-xs font-semibold text-stone-900"
              style={{ backgroundColor: secondaryValid ? secondaryColor : '#84dccf' }}
            >
              Accent button
            </span>
          </div>

          <Button
            disabled={saveColors.isPending || !primaryValid || !secondaryValid}
            onClick={() =>
              saveColors.mutate({
                churchId,
                primaryColor,
                secondaryColor,
              })
            }
          >
            {saveColors.isPending ? 'Saving…' : 'Save colors'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>
            Update payment method or cancel via Stripe Customer Portal.
          </CardDescription>
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
            <CardDescription>Giving URL is available on Growth and Custom plans.</CardDescription>
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
