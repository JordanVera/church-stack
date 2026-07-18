'use client';

import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const steps = [
  { n: '01', title: 'Add the church', body: 'Create a tenant with its name, branding, and feature flags.' },
  { n: '02', title: 'Brand it', body: 'Colors and logo flow into the app automatically at runtime.' },
  {
    n: '03',
    title: 'Ship it',
    body: 'Generate a per-church build and publish to the App Store & Google Play.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-slate-50 py-24 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            From zero to published in three steps
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900"
            >
              <div className="font-display text-5xl font-bold text-brand-100 dark:text-brand-500/30">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
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
