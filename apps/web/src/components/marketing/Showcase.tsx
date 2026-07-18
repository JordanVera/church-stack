'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/motion';

const stats = [
  { value: '3 days', label: 'Typical launch time' },
  { value: '2 stores', label: 'iOS & Android from one build' },
  { value: '1 codebase', label: 'Every church, centrally updated' },
];

export default function Showcase() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid items-center gap-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-14 dark:border-slate-800 dark:bg-slate-900">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-slate-900/10 dark:ring-white/10"
        >
          <Image
            src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80"
            alt="Interior of a modern church building"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        <div>
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Built for the way churches actually work
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              From the smallest congregation to a growing multi-site network, Church Stack keeps every
              community connected with a home in their pocket — announcements, events, and giving all
              in one branded place.
            </p>
          </Reveal>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <dt className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
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
              className="mt-8 inline-block rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View pricing
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
