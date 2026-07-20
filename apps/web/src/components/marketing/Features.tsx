'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Smartphone, Palette, Zap, CalendarDays, HandHeart, Megaphone } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Card, CardContent } from '@/components/ui/card';

const cells = [
  {
    icon: Palette,
    title: 'Fully whitelabel',
    body: 'Your logo, your colors, your name on the App Store and Google Play. No "powered by" badge, ever.',
    className: 'lg:col-span-2',
    feature: true,
  },
  {
    icon: Zap,
    title: 'Launch in days',
    body: 'Go from sign-up to a published app without waiting on a dev team or agency timeline.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    body: 'Push updates straight to every phone the moment something changes.',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    body: 'A shared calendar with RSVPs, reminders, and directions built in.',
  },
  {
    icon: HandHeart,
    title: 'Giving-ready',
    body: 'Accept one-time and recurring gifts without sending people to a separate site.',
  },
  {
    icon: Smartphone,
    title: 'iOS & Android',
    body: 'One dashboard powers both native apps, so your team never manages two codebases.',
    className: 'lg:col-span-3',
    wide: true,
  },
];

const orbitColors = ['#55bae8', '#f5b07a', '#f4a5c8', '#a78bfa', '#34d399', '#fbbf24'];

const brandIcons = [
  { initials: 'GC', from: '#f5d0a9', to: '#c47a8a', rotate: -14, x: -58, y: -42 },
  { initials: 'HV', from: '#7dd3c0', to: '#2a7a6b', rotate: 10, x: 52, y: -36 },
  { initials: 'RC', from: '#c4b5fd', to: '#5b6eae', rotate: -8, x: -48, y: 48 },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
          What's included
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
          Everything, out of the box
        </h2>
        <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">
          Every plan ships with the core tools your church needs to stay connected — no add-ons
          required.
        </p>
      </Reveal>

      <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cells.map((c) => (
          <StaggerItem
            key={c.title}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={c.className}
          >
            <Card
              className={`group relative h-full overflow-hidden rounded-3xl border py-12 shadow-sm ring-0 transition-shadow hover:shadow-xl hover:shadow-brand-600/10 ${
                c.feature || c.wide
                  ? 'border-brand-500/20 bg-linear-to-br from-brand-600 to-brand-800 text-white'
                  : 'border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900'
              }`}
            >
              {c.feature && <WhitelabelVisual />}
              {c.wide && <DevicesVisual />}
              <CardContent
                className={`relative px-7 ${c.feature || c.wide ? 'sm:max-w-[55%] lg:max-w-[48%]' : ''}`}
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
                    c.feature || c.wide
                      ? 'bg-white/15 text-white'
                      : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300'
                  }`}
                >
                  <c.icon className="h-6 w-6" />
                </div>
                <h3
                  className={`mt-5 font-display font-semibold ${
                    c.feature || c.wide
                      ? 'text-2xl text-white'
                      : 'text-lg text-ink-900 dark:text-white'
                  }`}
                >
                  {c.title}
                </h3>
                <p
                  className={`mt-2 max-w-md text-sm leading-relaxed ${
                    c.feature || c.wide ? 'text-brand-100' : 'text-ink-600 dark:text-ink-300'
                  }`}
                >
                  {c.body}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** Animated brand constellation — icons, orbiting color, store badge. */
function WhitelabelVisual() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] sm:block"
    >
      <div className="absolute inset-0 bg-linear-to-l from-brand-900/45 via-transparent to-transparent" />

      {/* Ambient color blooms */}
      <div className="absolute right-8 top-6 h-28 w-28 rounded-full bg-[#f4a5c8]/25 blur-3xl" />
      <div className="absolute bottom-8 right-16 h-32 w-32 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="absolute right-28 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[#a78bfa]/20 blur-3xl" />

      <div className="absolute right-2 top-1/2 h-55 w-55 -translate-y-1/2 lg:right-6 lg:h-60 lg:w-60">
        {/* Slow-spinning color orbit */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {orbitColors.map((color, i) => {
            const angle = (i / orbitColors.length) * Math.PI * 2 - Math.PI / 2;
            const r = 46; // % from center
            const left = 50 + Math.cos(angle) * r;
            const top = 50 + Math.sin(angle) * r;
            return (
              <span
                key={color}
                className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg ring-2 ring-white/40"
                style={{
                  backgroundColor: color,
                  left: `${left}%`,
                  top: `${top}%`,
                  boxShadow: `0 0 18px ${color}88`,
                }}
              />
            );
          })}
        </motion.div>

        {/* Dashed orbit ring */}
        <div className="absolute inset-[18%] rounded-full border border-dashed border-white/25" />
        <motion.div
          className="absolute inset-[8%] rounded-full border border-white/10"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={reduce ? undefined : { duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.18) 8%, transparent 18%, transparent 100%)',
          }}
        />

        {/* Satellite brand icons */}
        {brandIcons.map((b, i) => (
          <motion.div
            key={b.initials}
            className="absolute left-1/2 top-1/2 z-10"
            initial={false}
            animate={
              reduce
                ? { x: b.x, y: b.y, rotate: b.rotate }
                : {
                    x: b.x,
                    y: [b.y, b.y - 8, b.y],
                    rotate: b.rotate,
                  }
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
              className="grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[0.9rem] shadow-xl ring-1 ring-white/35"
              style={{
                background: `linear-gradient(145deg, ${b.from}, ${b.to})`,
              }}
            >
              <span className="text-[11px] font-bold tracking-wide text-white drop-shadow-sm">
                {b.initials}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Hero app icon */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
          transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/15 blur-xl" />
            <div className="relative grid h-22 w-22 place-items-center overflow-hidden rounded-[1.55rem] bg-linear-to-br from-white via-[#e8f6fc] to-brand-400 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55)] ring-2 ring-white/50 lg:h-24 lg:w-24 lg:rounded-[1.75rem]">
              {/* Inner sheen */}
              <div className="absolute inset-0 bg-linear-to-br from-white/70 via-transparent to-transparent" />
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#f4a5c8]/40 blur-2xl" />
              <div className="absolute -bottom-3 -left-2 h-14 w-14 rounded-full bg-brand-500/35 blur-xl" />
              <span className="relative font-display text-3xl font-bold text-brand-800 drop-shadow-sm lg:text-4xl">
                ✦
              </span>
            </div>

            {/* Live brand pulse */}
            {!reduce && (
              <motion.span
                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#34d399] ring-2 ring-brand-700"
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
        </motion.div>

        {/* Floating store badge */}
        <motion.div
          className="absolute bottom-1 right-2 z-30 lg:bottom-0 lg:right-0"
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={
            reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }
          }
        >
          <div className="rounded-xl border border-white/25 bg-white/95 px-2.5 py-1.5 shadow-xl shadow-black/25 backdrop-blur-sm">
            <p className="text-[8px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
              App Store
            </p>
            <p className="font-display text-[11px] font-bold text-ink-900">Grace Church</p>
            <div className="mt-0.5 flex items-center gap-1">
              <div className="flex gap-px">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="h-1 w-1 rounded-full bg-amber-400" />
                ))}
              </div>
              <span className="text-[8px] font-medium text-ink-500">4.9 · Free</span>
            </div>
          </div>
        </motion.div>

        {/* Color chip strip */}
        <motion.div
          className="absolute left-0 top-2 z-30 lg:top-0"
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={
            reduce ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
          }
        >
          <div className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 p-1.5 shadow-lg backdrop-blur-md">
            {orbitColors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="h-4 w-4 rounded-full ring-1 ring-white/40"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="px-1.5 text-[9px] font-bold tracking-wide text-white/80">
              Your colors
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Dual-device mock: iOS + Android phones sharing the same branded app. */
function DevicesVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] sm:block"
    >
      <div className="absolute inset-0 bg-linear-to-l from-brand-900/50 via-brand-800/20 to-transparent" />
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-end gap-3 lg:right-10 lg:gap-4">
        {/* iOS phone */}
        <div className="relative w-27 shrink-0 lg:w-30">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/25 bg-ink-950 shadow-2xl shadow-black/40 ring-1 ring-white/10">
            <div className="flex justify-center pt-2">
              <span className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>
            <PhoneScreen church="Harbor" accent="#55bae8" />
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold tracking-wider text-white/55 uppercase">
            iOS
          </p>
        </div>

        {/* Android phone — slightly offset / larger for depth */}
        <div className="relative mb-1 w-29.5 shrink-0 translate-y-1 lg:w-33">
          <div className="overflow-hidden rounded-[1.1rem] border border-white/25 bg-ink-950 shadow-2xl shadow-black/50 ring-1 ring-white/10">
            <div className="flex items-center justify-between px-3 pt-2 text-[8px] font-semibold text-white/45">
              <span>9:41</span>
              <div className="flex items-center gap-0.5">
                <span className="h-1 w-2.5 rounded-sm bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
              </div>
            </div>
            <PhoneScreen church="Harbor" accent="#e8a87c" />
            <div className="flex justify-center pb-2 pt-1">
              <span className="h-1 w-8 rounded-full bg-white/25" />
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold tracking-wider text-white/55 uppercase">
            Android
          </p>
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({ church, accent }: { church: string; accent: string }) {
  return (
    <div className="space-y-1.5 px-2.5 pb-3 pt-2">
      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg text-[9px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {church.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-white">{church} Church</p>
          <p className="text-[8px] text-white/45">Your church app</p>
        </div>
      </div>
      <div className="rounded-lg bg-white/5 px-2 py-1.5">
        <p className="text-[7px] font-semibold tracking-wider text-white/40 uppercase">Live</p>
        <p className="text-[10px] font-semibold text-white">Sunday Service</p>
      </div>
      <div className="rounded-lg bg-white/5 px-2 py-1.5">
        <p className="text-[7px] font-semibold tracking-wider text-white/40 uppercase">Events</p>
        <p className="text-[10px] font-semibold text-white">Youth night</p>
      </div>
      <div
        className="rounded-lg py-1.5 text-center text-[9px] font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        Open app
      </div>
    </div>
  );
}
