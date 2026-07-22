'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { PLAN_TIERS, type PlanTierId } from '@repo/config';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

function parsePlan(value: string | null): PlanTierId | null {
  if (value === 'SITE' || value === 'GROWTH' || value === 'CUSTOM') return value;
  return null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const churchId = searchParams.get('churchId') ?? undefined;
  const planFromQuery = parsePlan(searchParams.get('plan'));

  const preview = trpc.billing.subscribePreview.useQuery(
    {
      churchId,
      planTier: planFromQuery ?? 'SITE',
    },
    { enabled: Boolean(churchId) }
  );

  const church = preview.data?.church;
  const planTier =
    planFromQuery ??
    (church?.planTier === 'SITE' || church?.planTier === 'GROWTH' || church?.planTier === 'CUSTOM'
      ? church.planTier
      : 'SITE');
  const plan = PLAN_TIERS[planTier];

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-20">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-12 text-brand-600 dark:text-brand-400" />
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
            You’re in
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-300">
            {church ? (
              <>
                Thanks —{' '}
                <span className="font-semibold text-ink-800 dark:text-ink-100">{church.name}</span>{' '}
                is on the{' '}
                <span className="font-semibold text-ink-800 dark:text-ink-100">{plan.name}</span>{' '}
                plan ({plan.priceLabel}
                {plan.period}).
              </>
            ) : churchId && preview.isLoading ? (
              <>Confirming your subscription…</>
            ) : (
              <>
                Thanks — your{' '}
                <span className="font-semibold text-ink-800 dark:text-ink-100">{plan.name}</span>{' '}
                subscription is starting ({plan.priceLabel}
                {plan.period}).
              </>
            )}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-ink-200/80 bg-white/85 px-6 py-7 text-left shadow-[0_20px_60px_-28px_rgba(34,24,28,0.35)] backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/75 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
            What happens next
          </p>
          <ol className="mt-4 space-y-4 text-sm leading-relaxed text-ink-700 dark:text-ink-300">
            <li className="flex gap-3">
              <span className="font-display font-semibold text-brand-600 dark:text-brand-400">
                1
              </span>
              <span>
                Stripe is confirming payment. Your plan usually updates within a minute.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-display font-semibold text-brand-600 dark:text-brand-400">
                2
              </span>
              <span>
                We’re provisioning your white-label site and coordinating church-named apps. Check
                your church home for the live site link.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-display font-semibold text-brand-600 dark:text-brand-400">
                3
              </span>
              <span>
                Content stays on one shared database — update once, and site + mobile stay in sync.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button className="h-11 px-6" render={<Link href="/dashboard" />}>
            Go to your church home
          </Button>
          <Button
            variant="outline"
            className="h-11 px-6"
            render={
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Church Stack onboarding')}`}
              />
            }
          >
            Email support
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-ink-500 dark:text-ink-400">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-24 text-ink-600 dark:text-ink-300">Loading…</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
