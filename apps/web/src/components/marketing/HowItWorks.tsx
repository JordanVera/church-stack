'use client';

import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const steps = [
  { n: '01', title: 'Lorem ipsum', body: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { n: '02', title: 'Dolor sit amet', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.' },
  { n: '03', title: 'Consectetur', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse.' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-slate-50 py-28 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
            Lorem ipsum
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            From zero to launched
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="font-display text-6xl font-bold text-brand-100 dark:text-brand-500/25">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
