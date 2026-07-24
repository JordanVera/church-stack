import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy · Church Stack',
  description: 'How Church Stack collects, uses, and protects information.',
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
        Legal
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">Last updated: July 24, 2026</p>

      <div className="mt-10 space-y-8 text-base leading-relaxed text-ink-700 dark:text-ink-300">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Who we are
          </h2>
          <p>
            Church Stack (“we”, “us”) provides white-label websites and related tools for churches.
            This policy explains what we collect when you use our platform site, church dashboards,
            and white-label church websites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Information we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Account data</strong> — name,
              email, and password hash when you register or sign in.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Church content</strong> — church
              profile, branding, pastors, locations, events, announcements, groups, sermon playlist
              links, logos, and similar content you enter in the dashboard.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Integrations</strong> — Planning
              Center personal access token credentials you choose to connect (stored so we can sync
              campuses, events, and groups on your behalf).
            </li>
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Visit plans</strong> — name, email,
              phone (optional), preferred date/service, and notes submitted by guests on your
              white-label site.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Billing</strong> — Stripe customer
              and subscription identifiers. Card details are processed by Stripe and are not stored
              on our servers.
            </li>
            <li>
              <strong className="text-ink-900 dark:text-ink-100">Technical data</strong> — basic
              server logs (IP, user agent, timestamps) needed to operate and secure the service.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            How we use information
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide and operate your church website, dashboard, and sync features</li>
            <li>Process subscriptions and manage billing with Stripe</li>
            <li>Notify church admins of visit plans (when email delivery is configured)</li>
            <li>Provide support and improve reliability and security</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Sharing
          </h2>
          <p>
            We share data with processors needed to run the product (for example Stripe for
            payments, Vercel for hosting, and YouTube when you link a public sermon playlist). We do
            not sell personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Retention &amp; security
          </h2>
          <p>
            We retain account and church data while your account is active and as needed for legal
            or billing obligations. We use reasonable technical and organizational measures to
            protect data. No method of transmission or storage is 100% secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Your choices
          </h2>
          <p>
            Church owners can update or delete most content from the dashboard. To request account
            deletion or a copy of your data, email{' '}
            <a
              className="font-medium text-brand-600 underline dark:text-brand-400"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Contact
          </h2>
          <p>
            Questions about this policy:{' '}
            <a
              className="font-medium text-brand-600 underline dark:text-brand-400"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            . See also our{' '}
            <Link href="/terms" className="font-medium text-brand-600 underline dark:text-brand-400">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
