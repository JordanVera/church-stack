'use client';

import { Marquee } from '@/components/motion';

const capabilities = [
  'Announcements',
  'Events',
  'Giving link',
  'Sermons',
  'Life groups',
  'Plan a visit',
  'Locations',
];

export default function LogoMarquee() {
  return (
    <section className="relative overflow-hidden bg-white py-14 dark:bg-ink-950">
      <Marquee duration={34} mask={false}>
        <div className="flex shrink-0 items-center gap-10 pr-10">
          {capabilities.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap font-display text-5xl font-bold uppercase tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgba(34,24,28,0.22)] sm:text-6xl lg:text-7xl dark:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.25)]"
            >
              {label}
              <span className="text-2xl text-brand-500 sm:text-3xl dark:text-brand-600">✦</span>
            </span>
          ))}
        </div>
      </Marquee>
    </section>
  );
}
