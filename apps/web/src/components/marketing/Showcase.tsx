'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Parallax, Reveal } from '@/components/motion';

const stats = [
  { value: '3 days', label: 'Lorem ipsum dolor' },
  { value: '2 stores', label: 'Consectetur adipiscing' },
  { value: '1 codebase', label: 'Sed do eiusmod tempor' },
];

export default function Showcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Parallax speed={40} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/20 ring-1 ring-slate-900/10 dark:ring-white/10">
            <Image
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80"
              alt="Interior of a modern church building"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent" />
          </div>
        </Parallax>

        <div>
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
              Lorem ipsum
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Built for how churches work
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris.
            </p>
          </Reveal>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <dt className="font-display text-3xl font-bold text-brand-600 dark:text-brand-300">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">
                  {s.label}
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2}>
            <Link
              href="/pricing"
              className="mt-9 inline-block rounded-xl border border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Lorem ipsum
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
