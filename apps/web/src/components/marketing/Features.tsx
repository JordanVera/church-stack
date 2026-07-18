'use client';

import { Smartphone, Palette, Zap, CalendarDays, HandHeart, Megaphone } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const features = [
  {
    icon: Palette,
    title: 'Fully whitelabel',
    body: 'Your name, your logo, your colors. Every app is branded for the individual church, top to bottom.',
  },
  {
    icon: Zap,
    title: 'Launch in days',
    body: 'One shared codebase, per-church config. Spin up a new church app without touching code.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    body: 'Push the week’s news straight to members’ phones and keep everyone in the loop.',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    body: 'Service times, small groups, and special events — always up to date.',
  },
  {
    icon: HandHeart,
    title: 'Giving-ready',
    body: 'Built with giving in mind so congregations can support the mission with a tap.',
  },
  {
    icon: Smartphone,
    title: 'iOS & Android',
    body: 'A single React Native app that ships to both stores from the same foundation.',
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Everything a church needs, out of the box
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Start with a solid foundation and customize per church.
        </p>
      </Reveal>

      <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <StaggerItem
            key={f.title}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-600/5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-slate-900 dark:text-white">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
