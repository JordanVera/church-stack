import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
        Subscription started
      </h1>
      <p className="mt-4 text-ink-600 dark:text-ink-300">
        Stripe will update your church plan shortly. White-label site and mobile stay on the same
        shared database.
      </p>
      <Link
        href="/onboard"
        className="mt-8 inline-block text-sm font-semibold text-brand-600 hover:underline"
      >
        Continue onboarding →
      </Link>
    </div>
  );
}
