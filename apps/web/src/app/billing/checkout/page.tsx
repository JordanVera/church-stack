'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import { PLAN_TIERS, type PlanTierId } from '@repo/config';
import { trpc } from '@/lib/trpc-client';
import { EmbeddedCheckoutForm } from '@/components/billing/EmbeddedCheckoutForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function parsePlan(value: string | null): PlanTierId | null {
  if (value === 'SITE' || value === 'GROWTH' || value === 'CUSTOM') return value;
  return null;
}

const PROGRESS_STEPS = ['Choose plan', 'Account', 'Payment'] as const;

function CheckoutForm() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const planTier = parsePlan(searchParams.get('plan'));
  const activeProgress = status === 'authenticated' ? 2 : 1;

  const callbackUrl = useMemo(() => {
    if (!planTier) return '/pricing';
    return `/billing/checkout?plan=${planTier}`;
  }, [planTier]);

  const preOnboardStatus = trpc.billing.preOnboardStatus.useQuery(
    { planTier: planTier ?? undefined },
    { enabled: status === 'authenticated' && planTier != null }
  );

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const sessionRequestedRef = useRef(false);

  const createPreOnboardCheckout = trpc.billing.createPreOnboardCheckout.useMutation({
    onSuccess: (data) => setClientSecret(data.clientSecret),
  });

  const register = trpc.auth.register.useMutation();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const returnUrl = useMemo(() => {
    if (!planTier || !origin) return '';
    return `${origin}/billing/success?plan=${planTier}&flow=pre_onboard&session_id={CHECKOUT_SESSION_ID}`;
  }, [planTier, origin]);

  useEffect(() => {
    if (
      sessionRequestedRef.current ||
      status !== 'authenticated' ||
      !planTier ||
      !returnUrl ||
      preOnboardStatus.isLoading ||
      preOnboardStatus.data?.canOnboard
    ) {
      return;
    }

    sessionRequestedRef.current = true;
    createPreOnboardCheckout.mutate({
      planTier,
      returnUrl,
    });
  }, [
    status,
    planTier,
    returnUrl,
    preOnboardStatus.isLoading,
    preOnboardStatus.data?.canOnboard,
    createPreOnboardCheckout.mutate,
  ]);

  const onAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        await register.mutateAsync({ name, email, password });
      }
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setAuthError(
          mode === 'signup'
            ? 'Account created, but sign-in failed. Try logging in.'
            : 'Invalid email or password.'
        );
        setAuthLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong.');
      setAuthLoading(false);
    }
  };

  if (!planTier) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
          Choose a plan
        </h1>
        <p className="mt-4 text-ink-600 dark:text-ink-300">
          Select Site, Growth, or Custom on the pricing page to continue.
        </p>
        <Button className="mt-8" render={<Link href="/pricing" />}>
          View pricing
        </Button>
      </div>
    );
  }

  const plan = PLAN_TIERS[planTier];
  const highlightFeatures = plan.features.slice(0, 5);
  const configured = preOnboardStatus.data?.configured ?? true;
  const priceConfigured = preOnboardStatus.data?.priceConfigured ?? true;
  const alreadyPaid = preOnboardStatus.data?.canOnboard ?? false;
  const payLabel = `${plan.priceLabel}${plan.period}`;

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-600 uppercase dark:text-brand-400">
            Get started
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Subscribe to {plan.name}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
            Create your account and complete payment on this page. After checkout, you&apos;ll
            register your church details.
          </p>
        </header>

        <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm sm:gap-3">
          {PROGRESS_STEPS.map((label, index) => {
            const done = index < activeProgress;
            const current = index === activeProgress;
            return (
              <li key={label} className="flex items-center gap-2 sm:gap-3">
                {index > 0 ? (
                  <span className="hidden h-px w-6 bg-ink-200 sm:block dark:bg-ink-700" aria-hidden />
                ) : null}
                <span
                  className={
                    current
                      ? 'font-semibold text-brand-600 dark:text-brand-400'
                      : done
                        ? 'font-medium text-ink-700 dark:text-ink-200'
                        : 'text-ink-400 dark:text-ink-500'
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="overflow-hidden rounded-3xl border border-ink-200/80 bg-white/85 shadow-[0_20px_60px_-28px_rgba(34,24,28,0.35)] backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/75 dark:shadow-[0_20px_60px_-28px_rgba(0,0,0,0.55)]">
          <div className="border-b border-ink-100 px-6 py-6 dark:border-ink-800 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
              Order summary
            </p>
            <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
                  {plan.name} plan
                </h2>
                <p className="text-sm text-ink-500 dark:text-ink-400">Billed monthly</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:text-right">
                <p className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {plan.priceLabel}
                  <span className="text-base font-normal text-ink-500 dark:text-ink-400">
                    {plan.period}
                  </span>
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {highlightFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-ink-300"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-ink-500 dark:text-ink-400">
              Need a different tier?{' '}
              <Link
                href="/pricing"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Change plan
              </Link>
            </p>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-8">
            {planTier === 'CUSTOM' ? (
              <p className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
                Custom may be sales-assisted. You can still check out at the base monthly rate when
                Stripe is configured; contact us for scoped custom work.
              </p>
            ) : null}

            {!configured || priceConfigured === false ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Billing is not configured yet. Set Stripe keys and price IDs, or ask Gatherly Stack
                staff to activate your plan.
              </p>
            ) : null}

            {alreadyPaid ? (
              <div className="space-y-4">
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  Payment confirmed for the {plan.name} plan. Continue to register your church.
                </p>
                <Button
                  className="h-11 w-full font-semibold"
                  render={<Link href={`/onboard?plan=${planTier}`} />}
                >
                  Register your church
                </Button>
              </div>
            ) : status === 'authenticated' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
                    Payment
                  </p>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                    Enter your payment details below. Church registration unlocks after payment
                    succeeds.
                  </p>
                </div>
                {createPreOnboardCheckout.error ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {createPreOnboardCheckout.error.message}
                  </p>
                ) : null}
                {clientSecret ? (
                  <EmbeddedCheckoutForm clientSecret={clientSecret} fallbackLabel={payLabel} />
                ) : (
                  <p className="text-sm text-ink-600 dark:text-ink-300">Preparing secure checkout…</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
                    Account
                  </p>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                    Create an account (or log in) to continue to secure payment.
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button
                    type="button"
                    className={
                      mode === 'signup'
                        ? 'font-semibold text-brand-600 dark:text-brand-400'
                        : 'text-ink-500'
                    }
                    onClick={() => setMode('signup')}
                  >
                    Create account
                  </button>
                  <span className="text-ink-300">·</span>
                  <button
                    type="button"
                    className={
                      mode === 'login'
                        ? 'font-semibold text-brand-600 dark:text-brand-400'
                        : 'text-ink-500'
                    }
                    onClick={() => setMode('login')}
                  >
                    Log in
                  </button>
                </div>
                <form onSubmit={onAuthSubmit} className="space-y-3">
                  {mode === 'signup' ? (
                    <div>
                      <Label htmlFor="name" className="mb-1">
                        Name
                      </Label>
                      <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  ) : null}
                  <div>
                    <Label htmlFor="email" className="mb-1">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="mb-1">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  {authError ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                  ) : null}
                  <Button
                    type="submit"
                    className="h-11 w-full font-semibold"
                    disabled={authLoading || register.isPending}
                  >
                    {authLoading || register.isPending
                      ? 'Working…'
                      : mode === 'signup'
                        ? 'Create account & continue'
                        : 'Log in & continue'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-24 text-ink-600 dark:text-ink-300">Loading…</div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
