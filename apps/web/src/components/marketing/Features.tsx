'use client';

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

const brandSwatches = ['#1a8bbd', '#e8a87c', '#7c9a7e', '#c47a8a', '#5b6eae'];

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

/** Brand-customization mock: store listing + palette, no stock photography. */
function WhitelabelVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] sm:block"
    >
      <div className="absolute inset-0 bg-linear-to-l from-brand-900/40 via-transparent to-transparent" />
      <div className="absolute right-5 top-1/2 w-[min(100%,220px)] -translate-y-1/2 lg:right-8 lg:w-60">
        {/* Soft glow behind the mock */}
        <div className="absolute -inset-6 rounded-3xl bg-white/5 blur-2xl" />

        {/* App Store–style listing card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-2xl shadow-brand-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.1rem] bg-linear-to-br from-[#f5d0a9] to-[#c47a8a] shadow-lg shadow-black/20 ring-1 ring-white/30">
              <span className="font-display text-lg font-bold text-white drop-shadow-sm">✦</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Grace Church</p>
              <p className="truncate text-[11px] text-white/60">Events · Giving · Live</p>
              <div className="mt-1.5 flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-amber-300/90" />
                  ))}
                </div>
                <span className="text-[10px] text-white/50">4.9</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5">
            {brandSwatches.map((color) => (
              <span
                key={color}
                className="h-6 flex-1 rounded-md ring-1 ring-white/25"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-white/95 py-2 text-center text-[11px] font-bold tracking-wide text-brand-800">
            GET — Free
          </div>
        </div>

        {/* Secondary branded icon floating behind */}
        <div className="absolute -bottom-3 -left-6 grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-brand-400 to-brand-600 shadow-lg ring-1 ring-white/25">
          <span className="text-sm font-bold text-white">GC</span>
        </div>
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
