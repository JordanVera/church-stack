'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Megaphone, Palette, Smartphone, Upload } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const orbitColors = ['#55bae8', '#f5b07a', '#f4a5c8', '#a78bfa', '#34d399', '#fbbf24'];

const steps = [
  {
    n: '01',
    title: 'Create your church',
    body: 'Register your church, add locations and pastors, and Church Stack stands up a branded site that looks like it was made in-house.',
    visual: 'brand' as const,
  },
  {
    n: '02',
    title: 'Add your content',
    body: 'Post announcements, events, sermons, and your external giving link from one dashboard — no code, no agency back-and-forth.',
    visual: 'content' as const,
  },
  {
    n: '03',
    title: 'Go live on the web',
    body: 'We provision your church website so visitors find service times, plan a visit, and explore your content under your brand.',
    visual: 'publish' as const,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
            How it works
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            From zero to launched
          </h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
            Three steps. Your brand stays front and center the whole way — on the dashboard and on
            your public site.
          </p>
        </Reveal>

        <Stagger className="mt-16 grid gap-12 lg:gap-4 lg:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm ring-0 transition-shadow hover:shadow-xl hover:shadow-brand-600/10 dark:border-white/10 dark:bg-white/5">
                <div className="relative h-52 overflow-hidden bg-linear-to-br from-brand-600 to-brand-800 sm:h-56">
                  {s.visual === 'brand' && <BrandVisual />}
                  {s.visual === 'content' && <ContentVisual />}
                  {s.visual === 'publish' && <PublishVisual />}
                </div>

                <div className="relative flex flex-1 flex-col px-7 py-7">
                  <span className="font-display text-3xl font-bold tracking-[0.2em] text-brand-500 dark:text-brand-400">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-ink-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {s.body}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/** Whitelabel-inspired brand constellation — create your church. */
function BrandVisual() {
  const reduce = useReducedMotion();

  const brandIcons = [
    { initials: 'GC', from: '#f5d0a9', to: '#c47a8a', rotate: -12, x: -52, y: -28 },
    { initials: 'HV', from: '#7dd3c0', to: '#2a7a6b', rotate: 9, x: 48, y: -22 },
    { initials: 'RC', from: '#c4b5fd', to: '#5b6eae', rotate: -6, x: -40, y: 36 },
  ];

  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute right-4 top-3 h-24 w-24 rounded-full bg-[#f4a5c8]/25 blur-3xl" />
      <div className="absolute bottom-2 left-6 h-28 w-28 rounded-full bg-brand-300/30 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {orbitColors.map((color, i) => {
            const angle = (i / orbitColors.length) * Math.PI * 2 - Math.PI / 2;
            const r = 44;
            const left = 50 + Math.cos(angle) * r;
            const top = 50 + Math.sin(angle) * r;
            return (
              <span
                key={color}
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg ring-2 ring-white/40"
                style={{
                  backgroundColor: color,
                  left: `${left}%`,
                  top: `${top}%`,
                  boxShadow: `0 0 16px ${color}88`,
                }}
              />
            );
          })}
        </motion.div>

        <div className="absolute inset-[20%] rounded-full border border-dashed border-white/25" />
        <motion.div
          className="absolute inset-[10%] rounded-full border border-white/10"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={reduce ? undefined : { duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.18) 8%, transparent 18%, transparent 100%)',
          }}
        />

        {brandIcons.map((b, i) => (
          <motion.div
            key={b.initials}
            className="absolute left-1/2 top-1/2 z-10"
            animate={
              reduce
                ? { x: b.x, y: b.y, rotate: b.rotate }
                : { x: b.x, y: [b.y, b.y - 7, b.y], rotate: b.rotate }
            }
            transition={
              reduce
                ? undefined
                : {
                    duration: 4.5 + i * 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.35,
                  }
            }
          >
            <div
              className="grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[0.75rem] shadow-xl ring-1 ring-white/35"
              style={{ background: `linear-gradient(145deg, ${b.from}, ${b.to})` }}
            >
              <span className="text-[10px] font-bold tracking-wide text-white drop-shadow-sm">
                {b.initials}
              </span>
            </div>
          </motion.div>
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, 2, 0, -2, 0] }}
          transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-white/15 blur-xl" />
            <div className="relative grid h-18 w-18 place-items-center overflow-hidden rounded-[1.35rem] bg-linear-to-br from-white via-[#e8f6fc] to-brand-400 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] ring-2 ring-white/50">
              <div className="absolute inset-0 bg-linear-to-br from-white/70 via-transparent to-transparent" />
              <span className="relative font-display text-2xl font-bold text-brand-800">✦</span>
            </div>
            {!reduce && (
              <motion.span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#34d399] ring-2 ring-brand-700"
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute left-3 top-3 z-30"
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={
          reduce ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
        }
      >
        <div className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 p-1.5 shadow-lg backdrop-blur-md">
          <Palette className="ml-1 h-3 w-3 text-white/80" />
          {orbitColors.slice(0, 4).map((color) => (
            <span
              key={color}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-white/40"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/** Content stacking into a branded feed. */
function ContentVisual() {
  const reduce = useReducedMotion();

  const cards = [
    { icon: Megaphone, label: 'Announcement', title: 'Sunday service at 10am', delay: 0 },
    { icon: CalendarDays, label: 'Event', title: 'Youth night · Fri 7pm', delay: 0.15 },
    { icon: Upload, label: 'Sermon', title: 'New message uploaded', delay: 0.3 },
  ];

  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-linear-to-t from-brand-900/40 via-transparent to-transparent" />
      <div className="absolute right-6 top-4 h-24 w-24 rounded-full bg-[#a78bfa]/25 blur-3xl" />

      <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            className="rounded-xl border border-white/20 bg-white/12 px-3 py-2.5 shadow-lg backdrop-blur-md"
            initial={reduce ? false : { opacity: 0, x: 24, y: 8 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            animate={reduce ? undefined : { y: [0, i % 2 === 0 ? -3 : 3, 0] }}
            transition={{
              opacity: { duration: 0.55, delay: c.delay, ease: [0.16, 1, 0.3, 1] },
              x: { duration: 0.55, delay: c.delay, ease: [0.16, 1, 0.3, 1] },
              y: {
                duration: 4 + i * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.8 + i * 0.2,
              },
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white">
                <c.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.14em] text-white/55 uppercase">
                  {c.label}
                </p>
                <p className="truncate text-[11px] font-semibold text-white">{c.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Dual-store publish scene. */
function PublishVisual() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-linear-to-l from-brand-900/35 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-8 h-28 w-28 rounded-full bg-accent-400/20 blur-3xl" />

      <div className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 items-end justify-center gap-3 px-4">
        <motion.div
          className="w-[42%]"
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="overflow-hidden rounded-[1.1rem] border border-white/25 bg-ink-950 shadow-2xl ring-1 ring-white/10">
            <div className="flex justify-center pt-1.5">
              <span className="h-1 w-8 rounded-full bg-white/20" />
            </div>
            <MiniPhoneScreen church="Grace" accent="#55bae8" />
          </div>
          <p className="mt-1.5 text-center text-[9px] font-semibold tracking-wider text-white/55 uppercase">
            Your site
          </p>
        </motion.div>

        <motion.div
          className="mb-1 w-[46%]"
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={
            reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
          }
        >
          <div className="overflow-hidden rounded-[0.95rem] border border-white/25 bg-ink-950 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between px-2.5 pt-1.5 text-[7px] font-semibold text-white/45">
              <span>9:41</span>
              <span className="h-1 w-2 rounded-sm bg-white/40" />
            </div>
            <MiniPhoneScreen church="Grace" accent="#e8a87c" />
            <div className="flex justify-center pb-1.5 pt-0.5">
              <span className="h-0.5 w-6 rounded-full bg-white/25" />
            </div>
          </div>
          <p className="mt-1.5 text-center text-[9px] font-semibold tracking-wider text-white/55 uppercase">
            Mobile web
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute right-3 top-3 z-30"
        animate={reduce ? undefined : { y: [0, 4, 0] }}
        transition={
          reduce ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
        }
      >
        <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/95 px-2.5 py-1.5 shadow-xl backdrop-blur-sm">
          <Smartphone className="h-3 w-3 text-brand-600" />
          <span className="text-[10px] font-bold text-ink-900">Live under your brand</span>
        </div>
      </motion.div>
    </div>
  );
}

function MiniPhoneScreen({ church, accent }: { church: string; accent: string }) {
  return (
    <div className="space-y-1 px-2 pb-2 pt-1.5">
      <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-1.5 py-1">
        <span
          className="grid h-5 w-5 place-items-center rounded-md text-[8px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {church.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold text-white">{church} Church</p>
          <p className="text-[7px] text-white/45">Your church site</p>
        </div>
      </div>
      <div
        className="rounded-md py-1 text-center text-[8px] font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        Visit site
      </div>
    </div>
  );
}
