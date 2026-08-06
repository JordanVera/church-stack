'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, Home, LayoutDashboard, Sparkles } from 'lucide-react';
import { LineReveal, Reveal, Stagger, StaggerItem } from '@/components/motion';
import Particles from '@/components/marketing/Particles';
import { Button } from '@/components/ui/button';

const destinations = [
  {
    href: '/',
    label: 'Home',
    description: 'Back to the landing page',
    icon: Home,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Manage your church app',
    icon: LayoutDashboard,
  },
  {
    href: '/pricing',
    label: 'Pricing',
    description: 'See plans and features',
    icon: Sparkles,
  },
  {
    href: '/login',
    label: 'Sign in',
    description: 'Access your account',
    icon: Compass,
  },
];

export default function NotFoundPage() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-white py-16 sm:min-h-[calc(100dvh-5rem)] sm:py-24 dark:bg-ink-950">
      <div className="absolute inset-0 -z-20 bg-grid text-ink-900/4 dark:text-white/5" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.2),transparent_55%),radial-gradient(ellipse_at_90%_90%,rgba(132,220,207,0.16),transparent_50%),radial-gradient(ellipse_at_5%_60%,rgba(120,114,114,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.35),transparent_55%),radial-gradient(ellipse_at_90%_90%,rgba(132,220,207,0.14),transparent_50%),radial-gradient(ellipse_at_5%_60%,rgba(26,139,189,0.18),transparent_45%)]"
      />
      <Particles className="pointer-events-none absolute inset-0 -z-10" density={9500} />

      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-40 top-16 -z-10 h-112 w-md rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/25"
            animate={{ y: [0, 32, 0], x: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-32 bottom-20 -z-10 h-104 w-104 rounded-full bg-accent-400/18 blur-3xl dark:bg-accent-500/20"
            animate={{ y: [0, -26, 0], x: [0, -16, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 40%, transparent 0%, transparent 42%, white 88%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 40%, transparent 0%, transparent 42%, #22181c 88%)',
        }}
      />

      {/* Wandering path — subtle wilderness motif */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden h-48 w-full -translate-y-1/2 opacity-[0.07] dark:opacity-[0.12] sm:block"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M-20 120 C 180 40, 320 180, 520 90 S 880 40, 1220 110"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="8 12"
          className="text-brand-600 dark:text-brand-300"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="relative mx-auto w-full max-w-4xl px-6">
        <div className="text-center">
          <Reveal>
            <p
              aria-hidden
              className="font-hero text-[clamp(6rem,28vw,13rem)] leading-none tracking-tight text-brand-500/15 dark:text-brand-400/20"
            >
              404
            </p>
          </Reveal>

          <div className="-mt-[clamp(3rem,14vw,6.5rem)]">
            <Reveal delay={0.08}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-300">
                Error
              </p>
            </Reveal>

            <h1 className="mt-4 font-hero text-[clamp(2.25rem,7vw,4.75rem)] uppercase leading-[0.92] tracking-tight text-ink-900 dark:text-white">
              <LineReveal delay={0.12}>Outside</LineReveal>{' '}
              <LineReveal delay={0.2} className="text-brand-600 dark:text-brand-400">
                The Promised Land
              </LineReveal>{' '}
              <LineReveal delay={0.28} className="text-accent-600 dark:text-accent-400">
                :)
              </LineReveal>
            </h1>

            <Reveal delay={0.36}>
              <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                The page you&apos;re looking for isn&apos;t found
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <Reveal delay={0.44}>
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
              Where would you like to go?
            </h2>
          </Reveal>

          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2">
            {destinations.map(({ href, label, description, icon: Icon }) => (
              <StaggerItem key={href}>
                <Link
                  href={href}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-ink-200/80 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-sm transition hover:border-brand-300 hover:bg-white hover:shadow-md dark:border-ink-800/80 dark:bg-ink-900/50 dark:hover:border-brand-700 dark:hover:bg-ink-900/80"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:group-hover:bg-brand-900/60">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-display text-base font-semibold text-ink-900 dark:text-white">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-500 dark:text-ink-400">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400"
                    aria-hidden
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.72} className="mt-10 flex justify-center">
            <Button size="lg" className="h-10 px-5 text-sm" render={<Link href="/" />}>
              Take me home
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
