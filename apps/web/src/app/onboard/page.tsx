'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChurchStep } from '@/components/onboard/ChurchStep';
import { PastorsStep } from '@/components/onboard/PastorsStep';
import { LocationsStep } from '@/components/onboard/LocationsStep';
import { AdminsStep } from '@/components/onboard/AdminsStep';
import { ReviewStep } from '@/components/onboard/ReviewStep';
import { StepIndicator } from '@/components/onboard/StepIndicator';
import {
  STEPS,
  createInitialDraft,
  isValidEmail,
  type OnboardDraft,
} from '@/components/onboard/types';

function validateStep(step: number, draft: OnboardDraft): string | null {
  if (step === 0) {
    if (!draft.name.trim()) return 'Church name is required.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || draft.slug.length < 2) {
      return 'Enter a valid slug (lowercase letters, numbers, hyphens).';
    }
    return null;
  }
  if (step === 1) {
    if (draft.pastors.length < 1) return 'Add at least one pastor.';
    for (const p of draft.pastors) {
      if (!p.firstName.trim() || !p.lastName.trim() || !p.title.trim()) {
        return 'Each pastor needs a first name, last name, and title.';
      }
    }
    return null;
  }
  if (step === 2) {
    if (draft.locations.length < 1) return 'Add at least one location.';
    for (const loc of draft.locations) {
      if (!loc.name.trim() || !loc.address.trim()) {
        return 'Each location needs a name and address.';
      }
      for (const email of loc.adminEmails) {
        if (email.trim() && !isValidEmail(email)) {
          return `Enter a valid admin email for ${loc.name || 'each location'}.`;
        }
      }
      for (const svc of loc.services) {
        if (!svc.name.trim() || !svc.startTime) {
          return 'Each service needs a name and start time.';
        }
      }
    }
    return null;
  }
  if (step === 3) {
    const emails = draft.adminEmails.map((e) => e.trim()).filter(Boolean);
    if (emails.length < 1) return 'Add at least one church admin email.';
    for (const email of emails) {
      if (!isValidEmail(email)) return 'Enter valid admin email addresses.';
    }
    return null;
  }
  return null;
}

export default function OnboardPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardDraft>(() => createInitialDraft());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; slug: string } | null>(null);

  const onboard = trpc.church.onboard.useMutation({
    onSuccess: (church) => {
      setDone({ name: church.name, slug: church.slug });
    },
  });

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
          You’re all set
        </h1>
        <p className="mt-3 text-ink-600 dark:text-ink-300">
          <span className="font-medium text-ink-800 dark:text-ink-100">{done.name}</span> (
          /{done.slug}) has been submitted. We’ll follow up with your admin contacts next.
        </p>
        <Button className="mt-8" render={<Link href="/" />}>
          Back to home
        </Button>
      </div>
    );
  }

  const goNext = () => {
    const validationError = validateStep(step, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = () => {
    const validationError =
      validateStep(0, draft) ||
      validateStep(1, draft) ||
      validateStep(2, draft) ||
      validateStep(3, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onboard.mutate({
      slug: draft.slug.trim(),
      name: draft.name.trim(),
      tagline: draft.tagline.trim() || null,
      adminEmails: draft.adminEmails.map((e) => e.trim()).filter(Boolean),
      pastors: draft.pastors.map((p) => ({
        clientKey: p.clientKey,
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        title: p.title.trim(),
      })),
      locations: draft.locations.map((loc) => ({
        name: loc.name.trim(),
        address: loc.address.trim(),
        pastorClientKey: loc.pastorClientKey,
        adminEmails: loc.adminEmails.map((e) => e.trim()).filter(Boolean),
        services: loc.services.map((svc) => ({
          name: svc.name.trim(),
          dayOfWeek: svc.dayOfWeek,
          startTime: svc.startTime,
        })),
      })),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Card className="border-ink-200 shadow-sm dark:border-ink-800">
        <CardHeader className="px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
            Church signup
          </p>
          <CardTitle className="font-display mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            Register your church
          </CardTitle>
          <CardDescription className="text-ink-600 dark:text-ink-300">
            Tell us about your church, pastors, campuses, and admin contacts.
          </CardDescription>
          <div className="mt-4">
            <StepIndicator current={step} />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {step === 0 ? <ChurchStep draft={draft} onChange={setDraft} /> : null}
          {step === 1 ? <PastorsStep draft={draft} onChange={setDraft} /> : null}
          {step === 2 ? <LocationsStep draft={draft} onChange={setDraft} /> : null}
          {step === 3 ? <AdminsStep draft={draft} onChange={setDraft} /> : null}
          {step === 4 ? <ReviewStep draft={draft} /> : null}

          {(error || onboard.error) && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error || onboard.error?.message}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0 || onboard.isPending}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={onboard.isPending}>
                {onboard.isPending ? 'Submitting…' : 'Submit church'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
