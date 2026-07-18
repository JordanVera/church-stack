'use client';

import { Reveal } from '@/components/motion';

const churches = [
  'Lorem Ipsum',
  'Dolor Sit',
  'Amet Church',
  'Consectetur',
  'Adipiscing',
  'Tempor',
  'Incididunt',
  'Magna Aliqua',
];

export default function LogoMarquee() {
  return (
    <section className="border-y border-slate-200/70 bg-slate-50/60 py-12 dark:border-slate-800/70 dark:bg-slate-900/30">
      <Reveal className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
          Lorem ipsum dolor sit amet
        </p>
      </Reveal>
      <div className="marquee-mask mt-8 flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-16 pr-16">
          {[...churches, ...churches].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-2xl font-semibold text-slate-400 dark:text-slate-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
