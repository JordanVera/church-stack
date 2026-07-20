'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  CalendarRange,
  CheckSquare,
  Church,
  Globe,
  Smartphone,
  Users,
  UserRound,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const synced = [
  { label: 'Groups', icon: Users },
  { label: 'Events', icon: CalendarDays },
  { label: 'Services', icon: Church },
  { label: 'Calendars', icon: CalendarRange },
  { label: 'Check-ins', icon: CheckSquare },
  { label: 'People', icon: UserRound },
];

export default function PlanningCenter() {
  const reduce = useReducedMotion();

  return (
    <section
      id="planning-center"
      className="relative scroll-mt-24 overflow-hidden bg-brand-50 py-12 text-ink-900 dark:bg-ink-950 dark:text-white"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(26,139,189,0.18),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(245,176,122,0.22),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,rgba(26,139,189,0.35),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(245,176,122,0.2),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,24,28,0.08)_1px,transparent_0)] bg-size-[28px_28px] opacity-60 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] dark:opacity-[0.35]"
      />
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-500/25"
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.12, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#f5b07a]/30 blur-3xl dark:bg-[#f5b07a]/20"
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <PlanningCenterLogo className="h-8 w-auto sm:h-10" alt="Planning Center" />
          </div>
          <p className="mt-8 text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-300">
            Native integration
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Add it once in Planning Center
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-600 dark:text-white/70">
            Groups, events, services, calendars, check-ins, people, and more sync straight to your
            Church Stack website and app — no re-entering the same content in two places.
          </p>
        </Reveal>

        {/* Sync story */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
            {/* Source */}
            <Reveal>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-400 uppercase dark:text-white/45">
                  You manage here
                </p>
                <div className="mt-5">
                  <PlanningCenterLogo className="h-7 w-auto opacity-95" alt="" decorative />
                  <p className="mt-2 text-sm text-ink-500 dark:text-white/50">
                    Your source of truth
                  </p>
                </div>

                <Stagger className="mt-6 grid grid-cols-2 gap-2.5">
                  {synced.map((item) => (
                    <StaggerItem key={item.label}>
                      <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-brand-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                        <item.icon className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-300" />
                        <span className="text-sm font-medium text-ink-800 dark:text-white/85">
                          {item.label}
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
                <p className="mt-3 text-center text-xs font-medium text-ink-400 dark:text-white/40">
                  + more
                </p>
              </div>
            </Reveal>

            {/* Flow connector */}
            <Reveal delay={0.15} className="flex justify-center">
              <SyncPulse reduce={reduce} />
            </Reveal>

            {/* Destinations */}
            <Reveal delay={0.25}>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-400 uppercase dark:text-white/45">
                  Shows up here
                </p>

                <div className="mt-5 space-y-3">
                  <DestinationRow
                    icon={Globe}
                    title="Your website"
                    subtitle="Events, groups, and calendars live on your site"
                    reduce={reduce}
                    delay={0}
                  />
                  <DestinationRow
                    icon={Smartphone}
                    title="Your church app"
                    subtitle="Same content, instantly on every phone"
                    reduce={reduce}
                    delay={0.35}
                  />
                </div>

                <div className="mt-6 flex items-center gap-2 rounded-full border border-pink-600/30 bg-orange-100 px-3.5 py-2 dark:border-orange-400/25 dark:bg-orange-400/10">
                  {!reduce && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-600 opacity-70 dark:bg-orange-400" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-600 dark:bg-orange-400" />
                    </span>
                  )}
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    Live sync · update once, publish everywhere
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanningCenterLogo({
  className,
  alt,
  decorative,
}: {
  className?: string;
  alt: string;
  decorative?: boolean;
}) {
  return (
    <>
      <Image
        src="/brand/planning-center-black.png"
        alt={decorative ? '' : alt}
        width={395}
        height={61}
        className={`dark:hidden ${className ?? ''}`}
        aria-hidden={decorative || undefined}
        priority={false}
      />
      <Image
        src="/brand/planning-center-white.png"
        alt={decorative ? '' : alt}
        width={395}
        height={61}
        className={`hidden dark:block ${className ?? ''}`}
        aria-hidden={decorative || undefined}
        priority={false}
      />
    </>
  );
}

function SyncPulse({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative flex h-16 w-full max-w-48 items-center justify-center lg:h-48 lg:w-20 lg:flex-col">
      {/* Line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-brand-500/50 to-transparent dark:via-brand-400/60 lg:inset-x-auto lg:inset-y-8 lg:left-1/2 lg:h-auto lg:w-px lg:bg-linear-to-b"
      />

      {/* Traveling pulse — mobile horizontal */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_18px_4px_rgba(26,139,189,0.4)] dark:bg-brand-300 dark:shadow-[0_0_18px_4px_rgba(85,186,232,0.55)] lg:hidden"
          animate={{ left: ['10%', '90%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.7 }}
        />
      )}
      {/* Traveling pulse — desktop vertical */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-brand-500 shadow-[0_0_18px_4px_rgba(26,139,189,0.4)] dark:bg-brand-300 dark:shadow-[0_0_18px_4px_rgba(85,186,232,0.55)] lg:block"
          animate={{ top: ['12%', '88%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.7 }}
        />
      )}

      <div className="relative z-10 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-brand-600 uppercase shadow-sm dark:border-white/15 dark:bg-ink-900 dark:text-brand-300 dark:shadow-lg">
        Sync
      </div>
    </div>
  );
}

function DestinationRow({
  icon: Icon,
  title,
  subtitle,
  reduce,
  delay,
}: {
  icon: typeof Globe;
  title: string;
  subtitle: string;
  reduce: boolean | null;
  delay: number;
}) {
  return (
    <motion.div
      className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-brand-50/80 px-4 py-3.5 dark:border-white/10 dark:bg-white/5"
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold text-ink-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-ink-500 dark:text-white/50">{subtitle}</p>
      </div>
    </motion.div>
  );
}
