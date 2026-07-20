import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
        Thank you
      </h1>
      <p className="mt-4 text-ink-600 dark:text-ink-300">
        Your subscription is starting. Stripe will update your church plan shortly — white-label site
        and mobile stay on the same shared database.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 text-sm font-semibold">
        <Link href="/" className="text-brand-600 hover:underline dark:text-brand-400">
          Back to home
        </Link>
        <Link href="/dev" className="text-ink-500 hover:underline dark:text-ink-400">
          Staff /dev console
        </Link>
      </div>
    </div>
  );
}
