import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service · Church Stack',
  description: 'Terms that govern use of Church Stack.',
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@churchstack.com';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-600 uppercase dark:text-brand-400">
        Legal
      </p>
      <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">Last updated: July 24, 2026</p>

      <div className="mt-10 space-y-8 text-base leading-relaxed text-ink-700 dark:text-ink-300">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Agreement
          </h2>
          <p>
            By creating an account or using Church Stack, you agree to these Terms. If you are
            accepting on behalf of a church or organization, you represent that you have authority
            to bind that organization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            The service
          </h2>
          <p>
            Church Stack provides software to operate a white-label church website, a staff
            dashboard, optional Planning Center sync, and related tools. Features available to you
            depend on your subscription plan. Mobile app white-label delivery may be fulfilled with
            our team’s assistance and is subject to App Store / Google Play requirements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Accounts &amp; content
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>You are responsible for account credentials and activity under your account.</li>
            <li>
              You retain ownership of content you upload. You grant us a license to host, display,
              and process that content solely to provide the service.
            </li>
            <li>
              You must have rights to any logos, media, Planning Center credentials, and third-party
              links (including giving and YouTube playlists) you connect.
            </li>
            <li>Do not use the service for unlawful, harmful, or abusive purposes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Billing
          </h2>
          <p>
            Paid plans are billed through Stripe according to the plan you select. Fees are
            generally non-refundable except where required by law. You can manage payment methods
            and cancellation through the Stripe Customer Portal linked from your dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Third-party services
          </h2>
          <p>
            Integrations (including Planning Center, Stripe, YouTube, and external giving providers)
            are governed by those providers’ terms. We are not responsible for outages or changes in
            third-party APIs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Disclaimer &amp; liability
          </h2>
          <p>
            The service is provided “as is.” To the fullest extent permitted by law, we disclaim
            warranties of merchantability, fitness for a particular purpose, and non-infringement.
            Our aggregate liability arising out of these Terms is limited to the fees you paid us in
            the three months before the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Changes
          </h2>
          <p>
            We may update these Terms by posting a revised version on this page. Continued use after
            changes become effective constitutes acceptance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
            Contact
          </h2>
          <p>
            Questions:{' '}
            <a
              className="font-medium text-brand-600 underline dark:text-brand-400"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            . See also our{' '}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 underline dark:text-brand-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
