'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Smartphone,
  User,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion';

const dotGridLight =
  'bg-[radial-gradient(circle_at_1px_1px,rgba(34,24,28,0.1)_1px,transparent_0)] bg-size-[24px_24px]';
const dotGridDark =
  'dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]';

export default function BigStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white py-12 text-ink-900  dark:bg-ink-950 dark:text-white">
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal delay={0.2} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
            Live sync
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            Instantly see every update, form, and gift
          </h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
            No exports, no manual entry, no waiting — every profile change and gift is captured the
            moment it happens.
          </p>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-16 grid gap-6 px-4 sm:px-8 xl:grid-cols-3 xl:gap-8 xl:px-12">
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute top-1/2 z-10 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_20px_4px_rgba(26,139,189,0.55)] xl:block dark:bg-white dark:shadow-[0_0_20px_4px_rgba(255,255,255,0.8)]"
            initial={{ left: '2%', opacity: 0 }}
            animate={{ left: ['2%', '98%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
          />
        )}

        {/* Member app — where updates happen */}
        <Reveal delay={0.1} className="xl:col-span-1">
          <StatementCard
            tone="brand"
            icon={Smartphone}
            title="your church"
            subtitle="Updates happen here…"
            syncLabel="Live sync"
          >
            <motion.div
              className="relative mx-auto mt-8 w-full max-w-[17rem] sm:mt-10 xl:max-w-[18rem]"
              initial={reduce ? undefined : { rotate: -4 }}
              animate={reduce ? undefined : { rotate: [-4, -2, -4], y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Phone mock stays dark in both themes */}
              <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-ink-950 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-semibold text-white/55">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1 w-3.5 rounded-full bg-white/45" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 pb-1 pt-3 text-white/80">
                  <ArrowLeft className="h-4 w-4 text-white/50" strokeWidth={2} />
                  <span className="text-sm font-semibold">Your profile</span>
                </div>

                <div className="space-y-2.5 px-4 pb-5 pt-2">
                  <Field label="Name" value="Hannah Barnes" />
                  <Field label="Address" value="1472 Alderwood Ln" active reduce={reduce} />
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="City" value="Portland" compact />
                    <Field label="State" value="OR" compact />
                    <Field label="Zip" value="97209" compact />
                  </div>
                  <div className="mt-3 rounded-xl bg-brand-500 py-2.5 text-center text-xs font-bold text-white shadow-lg shadow-brand-900/40">
                    Save changes
                  </div>
                </div>
              </div>
            </motion.div>
          </StatementCard>
        </Reveal>

        {/* Admin dashboard — where it shows up */}
        <Reveal delay={0.2} className="xl:col-span-2">
          <StatementCard
            tone="accent"
            icon={LayoutDashboard}
            title="dashboard"
            subtitle="Shows up here."
            syncLabel="Updated just now"
          >
            <motion.div
              className="relative mx-auto mt-8 w-full max-w-lg sm:mt-10"
              initial={reduce ? undefined : { y: 0 }}
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white text-ink-900 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)] ring-1 ring-ink-100 dark:border-white/20 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:ring-white/30">
                <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/80 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  <span className="ml-2 truncate text-[11px] font-medium text-ink-500">
                    People · Hannah Barnes
                  </span>
                </div>

                <div className="flex min-h-[220px]">
                  <aside className="hidden w-[4.5rem] shrink-0 flex-col items-center gap-4 border-r border-ink-100 bg-ink-50/60 py-5 sm:flex">
                    <NavIcon icon={LayoutDashboard} />
                    <NavIcon icon={Users} active />
                    <NavIcon icon={ClipboardList} />
                    <NavIcon icon={MessageSquare} />
                    <NavIcon icon={Bell} badge />
                  </aside>

                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-md">
                          HB
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ink-900">Hannah Barnes</p>
                          <p className="text-xs text-ink-500">Member since 2019</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-600 shadow-sm">
                        Actions <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <DetailRow icon={Mail} muted />
                      <DetailRow icon={Phone} muted short />
                      <DetailRow
                        icon={MapPin}
                        highlight
                        text="1472 Alderwood Ln, Portland OR 97209"
                      />
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-[11px] font-semibold text-accent-800">
                      {!reduce && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-600" />
                        </span>
                      )}
                      Address synced from app
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </StatementCard>
        </Reveal>
      </div>
    </section>
  );
}

function StatementCard({
  tone,
  icon: Icon,
  title,
  subtitle,
  syncLabel,
  children,
}: {
  tone: 'brand' | 'accent';
  icon: typeof Smartphone;
  title: string;
  subtitle: string;
  syncLabel: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const isBrand = tone === 'brand';

  return (
    <div
      className={`relative flex h-[640px] flex-col overflow-hidden rounded-[2rem] border p-8 shadow-xl sm:p-10 ${
        isBrand
          ? 'border-brand-300 bg-linear-to-br from-brand-200 via-brand-100 to-brand-50 shadow-brand-500/15 dark:border-brand-400/25 dark:from-brand-700 dark:via-brand-800 dark:to-ink-950 dark:shadow-none'
          : 'border-accent-300 bg-linear-to-br from-accent-200 via-accent-100 to-brand-50 shadow-accent-500/20 dark:border-accent-400/25 dark:from-accent-700/90 dark:via-brand-800 dark:to-ink-950 dark:shadow-none'
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-40 dark:opacity-40 ${dotGridLight} ${dotGridDark}`}
      />
      {!reduce && (
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-16 top-1/4 h-56 w-56 rounded-full blur-3xl ${
            isBrand
              ? 'bg-brand-400/45 dark:bg-brand-400/30'
              : 'bg-accent-400/40 dark:bg-accent-400/25'
          }`}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg ring-1 ${
                isBrand
                  ? 'bg-white text-brand-600 ring-brand-200 dark:bg-white/95 dark:ring-white/20'
                  : 'bg-white text-accent-700 ring-accent-200 dark:bg-white/95 dark:ring-white/20'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
              {title}
            </span>
          </div>
          <p className="mt-2 text-base font-medium text-ink-600 dark:text-white/75">{subtitle}</p>
        </div>

        <div className="shrink-0 rounded-full border border-ink-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-700 backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:text-white/90">
          {!reduce && (
            <span className="relative mr-2 inline-flex h-1.5 w-1.5 align-middle">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60 dark:bg-white" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-white" />
            </span>
          )}
          {syncLabel}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-end">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  active,
  compact,
  reduce,
}: {
  label: string;
  value: string;
  active?: boolean;
  compact?: boolean;
  reduce?: boolean | null;
}) {
  return (
    <div
      className={`rounded-xl border px-3 transition-colors ${compact ? 'py-2' : 'py-2.5'} ${
        active
          ? 'border-brand-400/70 bg-brand-500/15 ring-2 ring-brand-400/35'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-0.5 font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
        {value}
        {active && !reduce && (
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-px bg-brand-300"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </p>
    </div>
  );
}

function NavIcon({
  icon: Icon,
  active,
  badge,
}: {
  icon: typeof User;
  active?: boolean;
  badge?: boolean;
}) {
  return (
    <span className="relative">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
          active
            ? 'bg-brand-500 text-white shadow-md shadow-brand-600/30'
            : 'text-ink-400 hover:bg-ink-100'
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-red-500" />
      )}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  text,
  muted,
  short,
  highlight,
}: {
  icon: typeof Mail;
  text?: string;
  muted?: boolean;
  short?: boolean;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-accent-300/80 bg-accent-50 px-3 py-2.5 shadow-sm">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
        <p className="text-sm font-semibold text-ink-800">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-1 py-1 text-sm text-ink-500">
      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
      <span
        className={`rounded-full bg-ink-100 ${short ? 'h-2 w-24' : 'h-2 flex-1'}`}
        aria-hidden
      />
    </div>
  );
}
