'use client';

import { useRef } from 'react';
import { Reveal, ScrollLine } from '@/components/motion';

const steps = [
  {
    n: '01',
    title: 'Create your church',
    body: 'Sign up, upload your logo and colors, and Church Stack generates your branded app shell instantly.',
  },
  {
    n: '02',
    title: 'Add your content',
    body: 'Post announcements, events, sermons, and giving links from one simple dashboard — no code required.',
  },
  {
    n: '03',
    title: 'Publish to both stores',
    body: 'We handle the App Store and Google Play submissions, so your congregation can download it under your name.',
  },
];

export default function HowItWorks() {
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <section id="how" className="scroll-mt-24 bg-ink-50 py-28 dark:bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
            How it works
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
            From zero to launched
          </h2>
        </Reveal>

        <div ref={timelineRef} className="relative mx-auto mt-20 max-w-2xl">
          <ScrollLine containerRef={timelineRef} className="left-6 top-2 bottom-2 sm:left-7" />

          <div className="space-y-14">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="relative flex gap-6 pl-0 sm:gap-8">
                <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-brand-500 bg-ink-50 font-display text-sm font-bold text-brand-600 dark:border-brand-400 dark:bg-ink-900 dark:text-brand-300 sm:h-14 sm:w-14">
                  {s.n}
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
