'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardDraft, OnboardLocation } from './types';
import { newClientKey } from './types';
import Image from 'next/image';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

const PCO_TOKENS_URL = 'https://api.planningcenteronline.com/personal_access_tokens';

type Props = {
  draft: OnboardDraft;
  onChange: (next: OnboardDraft) => void;
};

function toOnboardLocations(
  imported: Array<{
    name: string;
    address: string;
    contactEmail: string | null;
    services: Array<{ name: string; dayOfWeek: number; startTime: string }>;
  }>
): OnboardLocation[] {
  return imported.map((loc) => ({
    key: newClientKey('loc'),
    name: loc.name,
    address: loc.address,
    pastorClientKey: null,
    adminEmails: loc.contactEmail ? [loc.contactEmail] : [],
    services:
      loc.services.length > 0
        ? loc.services.map((svc) => ({
            key: newClientKey('svc'),
            name: svc.name,
            dayOfWeek: svc.dayOfWeek,
            startTime: svc.startTime,
          }))
        : [
            {
              key: newClientKey('svc'),
              name: 'Sunday Worship',
              dayOfWeek: 0,
              startTime: '10:00',
            },
          ],
  }));
}

function supportMailto(subject: string) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function PlanningCenterImport({ draft, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [secret, setSecret] = useState('');

  const preview = trpc.church.previewPlanningCenterCampuses.useMutation({
    onSuccess: (data) => {
      const locations = toOnboardLocations(data.locations);
      const serviceCount = data.locations.reduce((n, loc) => n + loc.services.length, 0);
      onChange({ ...draft, locations });
      setOpen(false);
      setSecret('');
      toast.success('Imported from Planning Center', {
        description: `${data.locations.length} campus${data.locations.length === 1 ? '' : 'es'} and ${serviceCount} service time${serviceCount === 1 ? '' : 's'} loaded. Review and edit the fields below before continuing.`,
        duration: 7000,
      });
    },
    onError: (err) => {
      toast.error('Planning Center import failed', {
        description: err.message,
        duration: 12000,
        action: {
          label: 'Email us',
          onClick: () => {
            window.location.href = supportMailto('Planning Center import help');
          },
        },
      });
    },
  });

  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-ink-900 dark:text-white">Import from</p>
            <Image
              src="/brand/planning-center-white.png"
              alt="Planning Center"
              width={200}
              height={200}
            />
          </div>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Pull campuses and weekly service times from PC. You can edit everything after import.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Cancel' : 'Import'}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 space-y-4">
          <div className="space-y-2 rounded-md border border-ink-200/80 bg-white/70 p-3 text-xs leading-relaxed text-ink-600 dark:border-ink-700 dark:bg-ink-950/50 dark:text-ink-300">
            <p className="font-medium text-ink-800 dark:text-ink-100">
              How to find your Application ID &amp; Secret
            </p>
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>
                Sign in to Planning Center, then open the developer portal:{' '}
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
                . Give it a name (e.g. “Church Stack import”).
              </li>
              <li>
                Copy the{' '}
                <span className="font-medium text-ink-800 dark:text-ink-100">Application ID</span>{' '}
                and <span className="font-medium text-ink-800 dark:text-ink-100">Secret</span> into
                the fields below. The secret is shown only once — if you lose it, create a new
                token.
              </li>
              <li>
                Use a token created by an Organization Administrator so People campuses are visible.
              </li>
            </ol>
            <p className="pt-1">
              Stuck or seeing an error?{' '}
              <a
                href={supportMailto('Planning Center import help')}
                className="font-medium text-brand-600 underline dark:text-brand-400"
              >
                Email {SUPPORT_EMAIL}
              </a>{' '}
              and we’ll help you connect. You can also skip import and enter locations manually.
            </p>
            <p className="text-ink-500 dark:text-ink-400">
              Credentials are used only for this import request and are not saved to your church
              record.
            </p>
          </div>

          <div>
            <Label htmlFor="pco-app-id" className="mb-1 text-ink-700 dark:text-ink-300">
              Application ID
            </Label>
            <Input
              id="pco-app-id"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              autoComplete="off"
              className="h-10"
              placeholder="From Personal Access Tokens"
            />
          </div>
          <div>
            <Label htmlFor="pco-secret" className="mb-1 text-ink-700 dark:text-ink-300">
              Secret
            </Label>
            <Input
              id="pco-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="off"
              className="h-10"
              placeholder="Shown once when the token is created"
            />
          </div>
          <Button
            type="button"
            disabled={preview.isPending || !applicationId.trim() || !secret.trim()}
            onClick={() => {
              preview.mutate({
                applicationId: applicationId.trim(),
                secret: secret.trim(),
              });
            }}
          >
            {preview.isPending ? 'Importing…' : 'Pull campuses'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
