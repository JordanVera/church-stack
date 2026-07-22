'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PLAN_TIER_LIST } from '@repo/config';
import { LineReveal, Reveal, Stagger, StaggerItem } from '@/components/motion';
import Particles from '@/components/marketing/Particles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PricingPage() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-24 sm:pt-18 dark:bg-ink-950">
      {/* Atmosphere — grid, brand washes, particles */}
      <div className="absolute inset-0 -z-20 bg-grid text-ink-900/4 dark:text-white/5" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.18),transparent_55%),radial-gradient(ellipse_at_85%_80%,rgba(132,220,207,0.14),transparent_50%),radial-gradient(ellipse_at_10%_70%,rgba(26,139,189,0.1),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.4),transparent_55%),radial-gradient(ellipse_at_85%_80%,rgba(132,220,207,0.16),transparent_50%),radial-gradient(ellipse_at_10%_70%,rgba(26,139,189,0.22),transparent_45%)]"
      />
      <Particles className="pointer-events-none absolute inset-0 -z-10" density={11000} />

      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/25"
            animate={{ y: [0, 28, 0], x: [0, 18, 0], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-28 bottom-32 -z-10 h-104 w-md rounded-full bg-accent-400/18 blur-3xl dark:bg-accent-500/22"
            animate={{ y: [0, -22, 0], x: [0, -14, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </>
      )}

      {/* Vignette so copy stays crisp over particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 35%, transparent 0%, transparent 45%, white 88%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 35%, transparent 0%, transparent 45%, #22181c 88%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Editorial header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-300">
              Plans · cancel anytime
            </p>
          </Reveal>

          <h1 className="mt-5 font-hero uppercase leading-[0.92] tracking-tight text-ink-900 text-[clamp(2.5rem,8vw,5.5rem)] dark:text-white">
            <LineReveal eager delay={0.1}>
              Simple, honest
            </LineReveal>
            <LineReveal eager delay={0.22} className="text-brand-500 dark:text-brand-400">
              pricing.
            </LineReveal>
          </h1>

          <Reveal
            delay={0.35}
            as="p"
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300"
          >
            White-label site and church-named apps on every plan. One shared database — content
            updates everywhere at once.
          </Reveal>
        </div>

        {/* Tier panels */}
        <Stagger className="mt-16 grid gap-6 pt-6 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {PLAN_TIER_LIST.map((tier) => (
            <StaggerItem
              key={tier.id}
              whileHover={reduce ? undefined : { y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`h-full ${tier.highlighted ? 'lg:z-10 lg:scale-[1.03]' : ''}`}
            >
              <Card
                className={`relative h-full overflow-visible rounded-2xl py-8 shadow-none ring-0 backdrop-blur-xl ${
                  tier.highlighted
                    ? 'border border-brand-400/50 bg-white/75 shadow-xl shadow-brand-600/15 ring-2 ring-brand-500/40 dark:border-brand-400/40 dark:bg-ink-900/70 dark:shadow-brand-500/20'
                    : 'border border-white/50 bg-white/55 dark:border-white/10 dark:bg-ink-900/45'
                }`}
              >
                {tier.highlighted && (
                  <Badge
                    variant="outline"
                    className="absolute -top-3 left-1/2 h-auto -translate-x-1/2 gap-2 rounded-full border-brand-300/60 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700 shadow-sm backdrop-blur-sm dark:border-brand-500/40 dark:bg-ink-900/90 dark:text-brand-300"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                    </span>
                    Most popular
                  </Badge>
                )}
                <CardContent className="flex h-full flex-col px-7 sm:px-8">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {tier.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-5xl font-bold tracking-tight text-ink-900 dark:text-white">
                      {tier.priceLabel}
                    </span>
                    <span className="text-sm text-ink-500 dark:text-ink-400">{tier.period}</span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-300"
                      >
                        <Check
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            tier.highlighted
                              ? 'text-accent-600 dark:text-accent-400'
                              : 'text-brand-600 dark:text-brand-300'
                          }`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="lg"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    className={`mt-8 h-auto rounded-full px-5 py-3.5 text-xs font-semibold uppercase tracking-widest ${
                      tier.highlighted
                        ? 'shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35'
                        : 'border-ink-200 bg-white/70 text-ink-700 backdrop-blur-sm hover:border-ink-300 hover:bg-white dark:border-white/20 dark:bg-transparent dark:text-ink-200 dark:hover:border-white/35 dark:hover:bg-white/5'
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

        {/* Footnotes */}
        <Reveal
          delay={0.15}
          className="mx-auto mt-16 max-w-2xl border-t border-ink-200/70 pt-10 text-center dark:border-white/10"
        >
          <div className="space-y-3 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            <p>
              Prices do <span className="font-medium text-ink-700 dark:text-ink-200">not</span>{' '}
              include purchasing a domain name. You buy and own your domain; we connect it to your
              site.
            </p>
            <p>
              Every plan hosts your church data on Church Stack (events, announcements, locations,
              and more) whether you sync from Planning Center or manage everything here — so site
              and mobile stay in sync on one database.
            </p>
            <p>
              Multi-campus networks: Custom base plus per-church seats. App Store / Play
              first-submission setup may include a one-time fee.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
