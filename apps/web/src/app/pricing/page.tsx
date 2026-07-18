'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

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
    features: ['Everything in Starter', 'Giving integration', 'Sermon series', 'Priority support'],
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
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Pick a plan per church. Cancel anytime. No agency invoices.
        </p>
      </Reveal>

      <Stagger className="mt-16 grid items-start gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <StaggerItem
            key={tier.name}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
              tier.highlighted
                ? 'border-brand-600 bg-white shadow-xl shadow-brand-600/10 ring-2 ring-brand-600 lg:-mt-4 lg:mb-4 dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                Most popular
              </span>
            )}
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {tier.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tier.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-slate-900 dark:text-white">
                {tier.price}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{tier.period}</span>
            </div>
            <ul className="mt-8 space-y-3">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <Check className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`mt-8 rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                tier.highlighted
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 hover:bg-brand-500'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tier.cta}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
