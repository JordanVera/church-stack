import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'For a single church getting started.',
    features: ['1 branded app', 'Announcements & events', 'iOS & Android builds', 'Email support'],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/mo',
    description: 'For growing churches that want it all.',
    features: [
      'Everything in Starter',
      'Giving integration',
      'Sermon series',
      'Priority support',
    ],
    cta: 'Choose Growth',
    highlighted: true,
  },
  {
    name: 'Network',
    price: 'Custom',
    period: '',
    description: 'For multi-site churches and networks.',
    features: ['Multiple churches', 'Central admin', 'Custom features', 'Dedicated support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Simple, honest pricing</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Pick a plan per church. Cancel anytime. No agency invoices.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-2xl border p-8 shadow-sm ${
              tier.highlighted
                ? 'border-indigo-600 ring-2 ring-indigo-600 dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tier.name}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tier.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">{tier.price}</span>
              <span className="text-slate-500 dark:text-slate-400">{tier.period}</span>
            </div>
            <ul className="mt-8 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`mt-8 rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                tier.highlighted
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
