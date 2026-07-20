'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLAN_TIER_LIST } from '@repo/config';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
          White-label site and church-named apps on every plan. One shared database — content
          updates everywhere at once. Cancel anytime.
        </p>
      </Reveal>

      <Stagger className="mt-16 grid items-start gap-8 pt-4 lg:grid-cols-3">
        {PLAN_TIER_LIST.map((tier) => (
          <StaggerItem
            key={tier.id}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={tier.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}
          >
            <Card
              className={`relative h-full overflow-visible rounded-2xl py-8 shadow-sm ring-0 ${
                tier.highlighted
                  ? 'border-brand-600 bg-white shadow-xl shadow-brand-600/10 ring-2 ring-brand-600 dark:bg-ink-900'
                  : 'border-ink-200 dark:border-ink-800 dark:bg-ink-900'
              }`}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 h-auto -translate-x-1/2 px-3 py-1 text-xs uppercase tracking-wide shadow-sm">
                  Most popular
                </Badge>
              )}
              <CardContent className="flex h-full flex-col px-8">
                <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-ink-900 dark:text-white">
                    {tier.priceLabel}
                  </span>
                  <span className="text-ink-500 dark:text-ink-400">{tier.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-300"
                    >
                      <Check className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant={tier.highlighted ? 'default' : 'outline'}
                  className={`mt-8 h-auto rounded-xl px-4 py-3 text-sm font-semibold ${
                    tier.highlighted
                      ? 'shadow-sm shadow-brand-600/30'
                      : 'border-ink-300 text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800'
                  }`}
                  render={
                    <Link
                      href={
                        tier.id === 'CUSTOM' ? '/onboard?plan=CUSTOM' : `/onboard?plan=${tier.id}`
                      }
                    />
                  }
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mx-auto mt-12 max-w-2xl space-y-3 text-center text-sm text-ink-500 dark:text-ink-400">
        <p>
          Prices do <span className="font-medium text-ink-700 dark:text-ink-200">not</span> include
          purchasing a domain name. You buy and own your domain; we connect it to your site.
        </p>
        <p>
          Every plan hosts your church data on Church Stack (events, announcements, locations, and
          more) whether you sync from Planning Center or manage everything here — so site and mobile
          stay in sync on one database.
        </p>
        <p>
          Multi-campus networks: Custom base plus per-church seats. App Store / Play
          first-submission setup may include a one-time fee.
        </p>
      </div>
    </div>
  );
}
