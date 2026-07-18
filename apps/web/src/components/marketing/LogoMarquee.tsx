'use client';

import { Marquee } from '@/components/motion';

const capabilities = [
  'Announcements',
  'Events',
  'Giving',
  'Sermons',
  'Groups',
  'Check-in',
  'Push notifications',
];

export default function LogoMarquee() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-14">
      <Marquee duration={34} mask={false}>
        <div className="flex shrink-0 items-center gap-10 pr-10">
          {capabilities.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap font-display text-5xl font-bold uppercase tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)] sm:text-6xl lg:text-7xl"
            >
              {label}
              <span className="text-2xl text-brand-400 sm:text-3xl">✦</span>
            </span>
          ))}
        </div>
      </Marquee>
    </section>
  );
}
