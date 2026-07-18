'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Counter, Parallax, Reveal } from '@/components/motion';

const stats = [
  { value: 3, suffix: ' days', label: 'From sign-up to a live app in both stores' },
  { value: 2, suffix: ' stores', label: 'iOS and Android, published under your name' },
  { value: 1, suffix: ' dashboard', label: 'For every announcement, event, and gift' },
];

export default function Showcase() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="grid items-stretch lg:grid-cols-2">
        <Parallax speed={30} className="relative min-h-[380px] lg:min-h-[640px]">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1400&q=80"
              alt="Interior of a modern church building"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent lg:hidden" />
          </div>
        </Parallax>

        <div className="relative flex items-center bg-white px-6 py-16 sm:px-12 lg:-ml-16 lg:rounded-l-[2.5rem] lg:py-0 lg:shadow-2xl lg:shadow-slate-900/10 dark:bg-slate-950 dark:lg:shadow-black/40">
          <div className="mx-auto max-w-lg lg:mx-0 lg:ml-16">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
                Why churches switch
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                Built for how churches work
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                No dev team, no agency retainer. Your staff manages announcements, events, and
                giving from one dashboard, and it shows up instantly in an app that looks and
                feels like it was built in-house.
              </p>
            </Reveal>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.1}>
                  <dt className="font-display text-3xl font-bold text-brand-600 dark:text-brand-300">
                    <Counter value={s.value} suffix={s.suffix} />
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
                View pricing
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
