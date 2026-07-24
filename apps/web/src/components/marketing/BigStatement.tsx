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
import { LineReveal, Reveal } from '@/components/motion';

const CYCLE = 4.2;

const packets = [
  { label: 'Visit date', delay: 0 },
  { label: 'Campus', delay: 1.4 },
  { label: 'Guest note', delay: 2.8 },
];

export default function BigStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-950 py-18 text-white">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Asymmetric editorial header — type is the composition */}
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-brand-300">
                Guest visits
              </p>
            </Reveal>
            <h2 className="mt-5 font-hero text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.88] tracking-tight uppercase">
              <LineReveal>They plan</LineReveal>
              <LineReveal delay={0.08} className="text-brand-400">
                a visit —
              </LineReveal>
              <LineReveal delay={0.16}>you see it.</LineReveal>
            </h2>
          </div>

          <Reveal delay={0.25} className="lg:pb-3">
            <p className="max-w-sm text-lg leading-relaxed text-white/60 lg:ml-auto lg:text-right">
              Plan-a-visit requests from your church site land in the owner dashboard (and email
              when Resend is configured) — no spreadsheets, no missed inbox threads.
            </p>
          </Reveal>
        </div>

        {/* Product stage — floating UIs, no enclosing cards */}
        <div className="relative mt-16 sm:mt-20 lg:mt-24">
          {/* Traveling sync packets (desktop) */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-[42%] right-[8%] left-[28%] z-30 hidden h-0 lg:block"
            >
              <svg className="absolute inset-x-0 -top-8 h-16 w-full overflow-visible" fill="none">
                <defs>
                  <linearGradient id="sync-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(85,186,232,0)" />
                    <stop offset="50%" stopColor="rgba(85,186,232,0.55)" />
                    <stop offset="100%" stopColor="rgba(245,176,122,0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 32 C 120 8, 280 8, 400 32 S 680 56, 820 32"
                  stroke="url(#sync-beam)"
                  strokeWidth="1.5"
                  strokeDasharray="6 10"
                />
              </svg>
              {packets.map((p) => (
                <motion.div
                  key={p.label}
                  className="absolute top-0 -translate-x-1/2 -translate-y-1/2"
                  initial={{ left: '0%', opacity: 0, y: 0 }}
                  animate={{
                    left: ['0%', '100%'],
                    opacity: [0, 1, 1, 0],
                    y: [0, -18, 8, 0],
                  }}
                  transition={{
                    duration: CYCLE,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    delay: p.delay,
                    times: [0, 0.15, 0.8, 1],
                  }}
                >
                  <span className="rounded-full border border-brand-300/40 bg-ink-900/90 px-3 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap text-brand-200 shadow-[0_0_24px_rgba(26,139,189,0.45)] backdrop-blur-sm">
                    {p.label}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            {/* Phone — source of truth for the member */}
            <Reveal
              y={40}
              className="relative z-20 mx-auto w-full max-w-[17.5rem] lg:mx-0 lg:justify-self-end"
            >
              <div className="mb-4 flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/45 bg-brand-500/25 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-brand-100 uppercase shadow-[0_0_24px_rgba(26,139,189,0.3)] backdrop-blur-sm">
                  <Smartphone className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Church site
                </span>
              </div>
              <motion.div
                animate={reduce ? undefined : { y: [0, -12, 0], rotate: [-3, -1.5, -3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {!reduce && (
                  <motion.div
                    aria-hidden
                    className="absolute -inset-10 rounded-[3rem] bg-brand-500/30 blur-3xl"
                    animate={{ opacity: [0.25, 0.55, 0.25] }}
                    transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <PhoneMock reduce={reduce} />
              </motion.div>
            </Reveal>

            {/* Dashboard — where staff see it */}
            <Reveal delay={0.15} y={40} className="relative z-10 w-full">
              <div className="mb-4 flex justify-center lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-300/50 bg-accent-400/25 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-accent-100 uppercase shadow-[0_0_24px_rgba(245,176,122,0.28)] backdrop-blur-sm">
                  <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Your dashboard
                </span>
              </div>
              <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                {!reduce && (
                  <motion.div
                    aria-hidden
                    className="absolute -inset-8 rounded-[2.5rem] bg-accent-400/20 blur-3xl"
                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                    transition={{
                      duration: CYCLE,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.8,
                    }}
                  />
                )}
                <DashboardMock reduce={reduce} />
              </motion.div>
            </Reveal>
          </div>

          {/* Mobile packet trail — vertical */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-[38%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 lg:hidden"
            >
              <motion.span
                className="rounded-full border border-brand-300/40 bg-ink-900/90 px-3 py-1 text-[10px] font-semibold text-brand-200 shadow-lg"
                animate={{ y: [0, 48], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 1.2,
                }}
              >
                Visit date
              </motion.span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PhoneMock({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative overflow-hidden rounded-[1.85rem] border border-white/15 bg-ink-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
      <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-semibold text-white/50">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span className="h-1 w-3.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-1 pt-3 text-white/80">
        <ArrowLeft className="h-4 w-4 text-white/45" strokeWidth={2} />
        <span className="text-sm font-semibold">Plan a visit</span>
      </div>

      <div className="space-y-2.5 px-4 pb-5 pt-2">
        <Field label="Name" value="Hannah Barnes" />
        <Field label="Visit date" value="Sunday, Aug 3" active reduce={reduce} />
        <Field label="Campus" value="North Campus" />
        <motion.div
          className="mt-3 rounded-xl bg-brand-500 py-2.5 text-center text-xs font-bold text-white"
          animate={
            reduce
              ? undefined
              : {
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(85,186,232,0)',
                    '0 0 0 8px rgba(85,186,232,0.25)',
                    '0 0 0 0 rgba(85,186,232,0)',
                  ],
                }
          }
          transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.12, 0.28],
          }}
        >
          Submit visit plan
        </motion.div>
      </div>
    </div>
  );
}

function DashboardMock({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-white text-ink-900 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/90 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
        <span className="ml-2 truncate text-[11px] font-medium text-ink-500">
          Visits · Hannah Barnes
        </span>
        {!reduce && (
          <motion.span
            className="ml-auto rounded-full bg-accent-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-accent-800 uppercase"
            animate={{ opacity: [0.4, 1, 1, 0.4], scale: [0.96, 1.05, 1, 0.96] }}
            transition={{
              duration: CYCLE,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.55, 0.7, 1],
              delay: 1.6,
            }}
          >
            Just now
          </motion.span>
        )}
      </div>

      <div className="flex min-h-[220px]">
        <aside className="hidden w-[4.5rem] shrink-0 flex-col items-center gap-4 border-r border-ink-100 bg-ink-50/70 py-5 sm:flex">
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
                <p className="text-xs text-ink-500">First-time guest</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-600 shadow-sm">
              Actions <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <DetailRow icon={Mail} />
            <DetailRow icon={Phone} short />
            <motion.div
              className="flex items-start gap-3 rounded-xl border border-accent-300/80 bg-accent-50 px-3 py-2.5"
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: [
                        '0 0 0 0 rgba(245,176,122,0)',
                        '0 0 0 6px rgba(245,176,122,0.3)',
                        '0 0 0 0 rgba(245,176,122,0)',
                      ],
                    }
              }
              transition={{
                duration: CYCLE,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.7,
                times: [0, 0.2, 0.45],
              }}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
              <p className="text-sm font-semibold text-ink-800">
                North Campus · Sunday 10:00am · Aug 3
              </p>
            </motion.div>
          </div>

          <motion.div
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-semibold text-white"
            animate={
              reduce
                ? undefined
                : { opacity: [0, 1, 1, 0], y: [6, 0, 0, 0], scale: [0.95, 1.02, 1, 1] }
            }
            transition={{
              duration: CYCLE,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.55, 0.85, 1],
              delay: 1.65,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            From your church site
          </motion.div>
        </div>
      </div>
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
    <motion.div
      className={`rounded-xl border px-3 ${compact ? 'py-2' : 'py-2.5'} ${
        active
          ? 'border-brand-400/70 bg-brand-500/15 ring-2 ring-brand-400/30'
          : 'border-white/10 bg-white/5'
      }`}
      animate={
        active && !reduce
          ? {
              boxShadow: [
                '0 0 0 0 rgba(85,186,232,0)',
                '0 0 0 4px rgba(85,186,232,0.3)',
                '0 0 0 0 rgba(85,186,232,0)',
              ],
            }
          : undefined
      }
      transition={
        active && !reduce
          ? { duration: CYCLE, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.35] }
          : undefined
      }
    >
      <p className="text-[9px] font-semibold tracking-wider text-white/40 uppercase">{label}</p>
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
    </motion.div>
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
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active ? 'bg-brand-500 text-white shadow-md shadow-brand-600/30' : 'text-ink-400'
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

function DetailRow({ icon: Icon, short }: { icon: typeof Mail; short?: boolean }) {
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
