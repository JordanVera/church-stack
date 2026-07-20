'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { ChurchStep } from '@/components/onboard/ChurchStep';
import { PastorsStep } from '@/components/onboard/PastorsStep';
import { LocationsStep } from '@/components/onboard/LocationsStep';
import { ReviewStep } from '@/components/onboard/ReviewStep';
import { StepIndicator } from '@/components/onboard/StepIndicator';
import {
  STEPS,
  createInitialDraft,
  isValidEmail,
  isValidOptionalUrl,
  type OnboardDraft,
} from '@/components/onboard/types';

function validateStep(step: number, draft: OnboardDraft): string | null {
  if (step === 0) {
    if (!draft.name.trim()) return 'Church name is required.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || draft.slug.length < 2) {
      return 'Enter a valid slug (lowercase letters, numbers, hyphens).';
    }
    const emails = draft.adminEmails.map((e) => e.trim()).filter(Boolean);
    if (emails.length < 1) return 'Add at least one admin email.';
    for (const email of emails) {
      if (!isValidEmail(email)) return 'Enter valid admin email addresses.';
    }
    for (const [label, value] of [
      ['Facebook', draft.facebookUrl],
      ['Instagram', draft.instagramUrl],
      ['YouTube', draft.youtubeUrl],
      ['Threads', draft.threadsUrl],
    ] as const) {
      if (!isValidOptionalUrl(value)) {
        return `${label} link must be a full URL (https://…), or leave it blank.`;
      }
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
  return null;
}

export default function OnboardPage() {
  const reduce = useReducedMotion();
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
      <div className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[70vh]  flex-col justify-center px-6 py-20 text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <CheckCircle2 className="mx-auto size-12 text-brand-600 dark:text-brand-400" />
            <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
              You’re all set
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-300">
              <span className="font-semibold text-ink-800 dark:text-ink-100">{done.name}</span>{' '}
              <span className="text-ink-400">/{done.slug}</span> has been submitted. We’ll follow up
              with your admin contacts next.
            </p>
            <Button className="mt-8 h-11 px-6" render={<Link href="/" />}>
              Back to home
            </Button>
          </motion.div>
        </div>
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
      validateStep(0, draft) || validateStep(1, draft) || validateStep(2, draft);
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
      facebookUrl: draft.facebookUrl.trim() || null,
      instagramUrl: draft.instagramUrl.trim() || null,
      youtubeUrl: draft.youtubeUrl.trim() || null,
      threadsUrl: draft.threadsUrl.trim() || null,
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

  const current = STEPS[step]!;

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-600 uppercase dark:text-brand-400">
            Church signup
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Register your church
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
            A short guided setup — church basics, pastors, campuses, then review.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-ink-200/80 bg-white/70 px-4 py-5 shadow-sm backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/60 sm:px-6">
          <StepIndicator current={step} />
        </div>

        <div className="overflow-hidden rounded-3xl border border-ink-200/80 bg-white/85 shadow-[0_20px_60px_-28px_rgba(34,24,28,0.35)] backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/75 dark:shadow-[0_20px_60px_-28px_rgba(0,0,0,0.55)]">
          <div className="border-b border-ink-100 px-6 py-5 dark:border-ink-800 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
              {current.label}
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{current.blurb}</p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 ? <ChurchStep draft={draft} onChange={setDraft} /> : null}
                {step === 1 ? <PastorsStep draft={draft} onChange={setDraft} /> : null}
                {step === 2 ? <LocationsStep draft={draft} onChange={setDraft} /> : null}
                {step === 3 ? <ReviewStep draft={draft} /> : null}
              </motion.div>
            </AnimatePresence>

            {(error || onboard.error) && (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error || onboard.error?.message}
              </p>
            )}

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-ink-100 pt-6 dark:border-ink-800">
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-1.5 px-4"
                onClick={goBack}
                disabled={step === 0 || onboard.isPending}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" className="h-11 gap-1.5 px-5" onClick={goNext}>
                  Continue
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="h-11 px-5"
                  onClick={submit}
                  disabled={onboard.isPending}
                >
                  {onboard.isPending ? 'Submitting…' : 'Submit church'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
