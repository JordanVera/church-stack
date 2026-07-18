'use client';

import Image from 'next/image';
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

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
          What's included
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Everything, out of the box
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
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
              className={`group relative h-full overflow-hidden rounded-3xl border py-7 shadow-sm ring-0 transition-shadow hover:shadow-xl hover:shadow-brand-600/10 ${
                c.feature || c.wide
                  ? 'border-brand-500/20 bg-gradient-to-br from-brand-600 to-brand-800 text-white'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {c.wide && (
                <div className="pointer-events-none absolute inset-0 opacity-30">
                  <Image
                    src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1400&q=80"
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-800 via-brand-700/80 to-transparent" />
                </div>
              )}
              <CardContent className="relative px-7">
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
                      : 'text-lg text-slate-900 dark:text-white'
                  }`}
                >
                  {c.title}
                </h3>
                <p
                  className={`mt-2 max-w-md text-sm leading-relaxed ${
                    c.feature || c.wide ? 'text-brand-100' : 'text-slate-600 dark:text-slate-300'
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
