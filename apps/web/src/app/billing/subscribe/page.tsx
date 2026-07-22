'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Check } from 'lucide-react';
import { PLAN_TIERS, type PlanTierId } from '@repo/config';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function parsePlan(value: string | null): PlanTierId {
  if (value === 'SITE' || value === 'GROWTH' || value === 'CUSTOM') return value;
  return 'SITE';
}

const PROGRESS_STEPS = ['Church details', 'Account', 'Payment'] as const;

function SubscribeForm() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const churchId = searchParams.get('churchId') ?? undefined;
  const slug = searchParams.get('slug') ?? undefined;
  const planTier = parsePlan(searchParams.get('plan'));
  const plan = PLAN_TIERS[planTier];
  const activeProgress = status === 'authenticated' ? 2 : 1;

  const callbackUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (churchId) params.set('churchId', churchId);
    if (slug) params.set('slug', slug);
    params.set('plan', planTier);
    return `/billing/subscribe?${params.toString()}`;
  }, [churchId, slug, planTier]);

  const preview = trpc.billing.subscribePreview.useQuery(
    { churchId, slug, planTier },
    { enabled: Boolean(churchId || slug) }
  );

  const claimAndCheckout = trpc.billing.claimAndCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const register = trpc.auth.register.useMutation();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const startCheckout = () => {
    const id = preview.data?.church.id;
    if (!id || !origin) return;
    claimAndCheckout.mutate({
      churchId: id,
      planTier,
      successUrl: `${origin}/billing/success?churchId=${encodeURIComponent(id)}&plan=${planTier}`,
      cancelUrl: `${origin}${callbackUrl}`,
    });
  };

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

  if (!churchId && !slug) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
          Missing church
        </h1>
        <p className="mt-4 text-ink-600 dark:text-ink-300">
          Open this page from church signup, or pass a churchId / slug.
        </p>
        <Button className="mt-8" render={<Link href="/pricing" />}>
          View pricing
        </Button>
      </div>
    );
  }

  if (preview.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-ink-600 dark:text-ink-300">Loading…</div>
    );
  }

  if (preview.error || !preview.data) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
          Church not found
        </h1>
        <Button className="mt-8" render={<Link href="/pricing" />}>
          Choose a plan
        </Button>
      </div>
    );
  }

  const { church, configured, priceConfigured } = preview.data;
  const highlightFeatures = plan.features.slice(0, 5);

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-600 uppercase dark:text-brand-400">
            Almost done
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Activate your plan
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
            Create your account, then continue to secure payment. Your white-label site and apps
            unlock after checkout succeeds.
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
                  {church.name}
                </h2>
                <p className="text-sm text-ink-500 dark:text-ink-400">/{church.slug}</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:text-right">
                <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
                  {plan.name}
                </p>
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  <span className="font-semibold text-ink-800 dark:text-ink-100">
                    {plan.priceLabel}
                  </span>
                  {plan.period}
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
            {!church.stripeSubscriptionId ? (
              <p className="mt-5 text-sm text-ink-500 dark:text-ink-400">
                Need a different tier?{' '}
                <Link
                  href="/pricing"
                  className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Change plan
                </Link>
              </p>
            ) : null}
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
                Billing is not configured yet. Set Stripe keys and price IDs, or ask Church Stack
                staff to activate your plan.
              </p>
            ) : null}

            {church.stripeSubscriptionId ? (
              <p className="text-sm text-ink-600 dark:text-ink-300">
                This church already has a Stripe subscription. Use Manage billing from your staff
                contact if you need to change plans.
              </p>
            ) : null}

            {status === 'authenticated' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
                    Payment
                  </p>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                    You’re signed in. Continue to Stripe Checkout — your plan unlocks after payment
                    succeeds.
                  </p>
                </div>
                {claimAndCheckout.error ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {claimAndCheckout.error.message}
                  </p>
                ) : null}
                <Button
                  className="h-11 w-full font-semibold"
                  disabled={
                    !configured ||
                    priceConfigured === false ||
                    claimAndCheckout.isPending ||
                    Boolean(church.stripeSubscriptionId)
                  }
                  onClick={startCheckout}
                >
                  {claimAndCheckout.isPending ? 'Redirecting…' : `Subscribe — ${plan.priceLabel}/mo`}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase">
                    Account
                  </p>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                    Create an account (or log in) with an admin email from your church signup to
                    continue to payment.
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
                      Admin email
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

export default function BillingSubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-24 text-ink-600 dark:text-ink-300">Loading…</div>
      }
    >
      <SubscribeForm />
    </Suspense>
  );
}
