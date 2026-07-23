'use client';

import { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { ChurchDashboardProvider } from '@/components/dashboard/ChurchDashboardProvider';
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  YoutubeIcon,
} from '@/components/onboard/SocialIcons';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [givingUrl, setGivingUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a8bbd');
  const [secondaryColor, setSecondaryColor] = useState('#84dccf');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [threadsUrl, setThreadsUrl] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  useEffect(() => {
    setGivingUrl(dash.data?.givingUrl ?? '');
  }, [dash.data?.givingUrl]);

  useEffect(() => {
    if (dash.data?.primaryColor) setPrimaryColor(dash.data.primaryColor);
    if (dash.data?.secondaryColor) setSecondaryColor(dash.data.secondaryColor);
  }, [dash.data?.primaryColor, dash.data?.secondaryColor]);

  useEffect(() => {
    setContactEmail(dash.data?.contactEmail ?? '');
    setPhone(dash.data?.phone ?? '');
    setAddress(dash.data?.address ?? '');
  }, [dash.data?.contactEmail, dash.data?.phone, dash.data?.address]);

  useEffect(() => {
    setFacebookUrl(dash.data?.facebookUrl ?? '');
    setInstagramUrl(dash.data?.instagramUrl ?? '');
    setYoutubeUrl(dash.data?.youtubeUrl ?? '');
    setThreadsUrl(dash.data?.threadsUrl ?? '');
  }, [
    dash.data?.facebookUrl,
    dash.data?.instagramUrl,
    dash.data?.youtubeUrl,
    dash.data?.threadsUrl,
  ]);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

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

  const saveContact = trpc.church.ownerUpdateContact.useMutation({
    onSuccess: async () => {
      toast.success('Contact info saved');
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const saveSocial = trpc.church.ownerUpdateSocial.useMutation({
    onSuccess: async () => {
      toast.success('Social links saved');
      await utils.church.getOwnerDashboard.invalidate({ slug });
    },
    onError: (err) => toast.error(err.message),
  });

  const data = dash.data;
  if (!data) return null;

  const primaryValid = HEX_COLOR.test(primaryColor);
  const secondaryValid = HEX_COLOR.test(secondaryColor);
  const logoPreview = pendingPreview ?? data.logoUrl ?? null;

  const clearPendingFile = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPickLogo = (file: File | null) => {
    if (!file) {
      clearPendingFile();
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!pendingFile) return;
    setLogoBusy(true);
    try {
      const form = new FormData();
      form.set('churchId', churchId);
      form.set('file', pendingFile);
      const res = await fetch('/api/church/logo', { method: 'POST', body: form });
      const body = (await res.json()) as { ok?: boolean; error?: string; logoUrl?: string | null };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Upload failed');
      }
      toast.success('Logo uploaded');
      clearPendingFile();
      await utils.church.getOwnerDashboard.invalidate({ slug });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLogoBusy(false);
    }
  };

  const removeLogo = async () => {
    setLogoBusy(true);
    try {
      const res = await fetch('/api/church/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || 'Could not remove logo');
      }
      toast.success('Logo removed');
      clearPendingFile();
      await utils.church.getOwnerDashboard.invalidate({ slug });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove logo');
    } finally {
      setLogoBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Branding, contact, social links, billing, and support.
        </p>
      </div>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
          <CardDescription>
            Shown on your white-label website header and hero. PNG, JPEG, WebP, or SVG up to 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-950">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="" className="h-full w-full object-contain p-1.5" />
              ) : (
                <span className="px-2 text-center text-xs text-ink-400">No logo</span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="logo-file">Image file</Label>
              <input
                ref={fileInputRef}
                id="logo-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="mt-1 block h-10 w-full cursor-pointer rounded-lg border border-ink-200 bg-transparent px-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1 file:text-sm file:font-medium dark:border-ink-700 dark:file:bg-ink-800"
                onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={logoBusy || !pendingFile} onClick={() => void uploadLogo()}>
              {logoBusy && pendingFile ? 'Uploading…' : 'Upload logo'}
            </Button>
            {data.logoUrl ? (
              <Button variant="outline" disabled={logoBusy} onClick={() => void removeLogo()}>
                {logoBusy && !pendingFile ? 'Removing…' : 'Remove logo'}
              </Button>
            ) : null}
            {pendingFile ? (
              <Button variant="ghost" disabled={logoBusy} onClick={clearPendingFile}>
                Cancel
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>
            Shown in the footer of your white-label website. Leave blank to hide a field.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                className="mt-1 h-10"
                placeholder="hello@yourchurch.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                className="mt-1 h-10"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="contact-address">Address</Label>
              <Input
                id="contact-address"
                className="mt-1 h-10"
                placeholder="123 Main St, City, ST 00000"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={saveContact.isPending}
            onClick={() =>
              saveContact.mutate({
                churchId,
                contactEmail: contactEmail.trim() || null,
                phone: phone.trim() || null,
                address: address.trim() || null,
              })
            }
          >
            {saveContact.isPending ? 'Saving…' : 'Save contact'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-ink-200 dark:border-ink-800 dark:bg-ink-900">
        <CardHeader>
          <CardTitle className="text-base">Social</CardTitle>
          <CardDescription>
            Full profile URLs for your site footer. Leave blank to hide a network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  id: 'facebook-url',
                  label: 'Facebook',
                  placeholder: 'https://facebook.com/yourchurch',
                  value: facebookUrl,
                  onChange: setFacebookUrl,
                  Icon: FacebookIcon,
                },
                {
                  id: 'instagram-url',
                  label: 'Instagram',
                  placeholder: 'https://instagram.com/yourchurch',
                  value: instagramUrl,
                  onChange: setInstagramUrl,
                  Icon: InstagramIcon,
                },
                {
                  id: 'youtube-url',
                  label: 'YouTube',
                  placeholder: 'https://youtube.com/@yourchurch',
                  value: youtubeUrl,
                  onChange: setYoutubeUrl,
                  Icon: YoutubeIcon,
                },
                {
                  id: 'threads-url',
                  label: 'Threads',
                  placeholder: 'https://threads.net/@yourchurch',
                  value: threadsUrl,
                  onChange: setThreadsUrl,
                  Icon: ThreadsIcon,
                },
              ] as const
            ).map(({ id, label, placeholder, value, onChange, Icon }) => (
              <div key={id}>
                <Label
                  htmlFor={id}
                  className="mb-1.5 inline-flex items-center gap-2 text-ink-700 dark:text-ink-300"
                >
                  <Icon className="size-6 rounded-md" />
                  {label}
                </Label>
                <Input
                  id={id}
                  type="url"
                  className="h-10"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button
            disabled={saveSocial.isPending}
            onClick={() =>
              saveSocial.mutate({
                churchId,
                facebookUrl: facebookUrl.trim() || null,
                instagramUrl: instagramUrl.trim() || null,
                youtubeUrl: youtubeUrl.trim() || null,
                threadsUrl: threadsUrl.trim() || null,
              })
            }
          >
            {saveSocial.isPending ? 'Saving…' : 'Save social links'}
          </Button>
        </CardContent>
      </Card>

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
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt=""
                className="mt-3 h-12 w-auto max-w-[160px] object-contain"
              />
            ) : null}
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
