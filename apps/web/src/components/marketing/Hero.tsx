'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bell, CalendarDays, HandHeart, Sparkles } from 'lucide-react';
import { Reveal, WordReveal } from '@/components/motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const chips = [
  { icon: Bell, label: 'New sermon posted', sub: 'Sunday • Grace Chapel', x: '-12%', y: '14%', delay: 0.9 },
  { icon: CalendarDays, label: 'Youth Night', sub: 'Fri 7:00 PM', x: '72%', y: '32%', delay: 1.1 },
  { icon: HandHeart, label: 'Give', sub: 'One tap, right in-app', x: '-6%', y: '72%', delay: 1.3 },
];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Layered background: gradient wash, dotted grid, floating brand blobs. */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute inset-0 -z-10 bg-grid text-slate-900/[0.05] dark:text-white/[0.05]" />
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-600/20"
            animate={{ y: [0, 24, 0], x: [0, 12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-16 top-40 -z-10 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl"
            animate={{ y: [0, -28, 0], x: [0, -10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div className="text-center lg:text-left">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-1.5 text-sm font-medium text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
          >
            <Sparkles className="h-4 w-4" />
            Whitelabel church apps, done fast
          </motion.span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
            <WordReveal text="A branded app for every" delay={0.15} />{' '}
            <WordReveal text="church." highlight={['church']} delay={0.55} />
          </h1>

          <Reveal
            as="p"
            delay={0.5}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0 dark:text-slate-300"
          >
            Church Stack is the platform for building and shipping beautiful, whitelabel apps for
            small and medium churches — quickly and repeatably.
          </Reveal>

          <Reveal delay={0.65} className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-600/40"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#features"
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              See features
            </Link>
          </Reveal>
        </div>

        {/* Phone mockup with floating app chips. */}
        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={reduce ? false : { opacity: 0, y: 40, rotate: -2 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Device frame */}
            <div className="relative mx-auto aspect-[9/19] w-[280px] rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-brand-900/20 dark:border-slate-800">
              <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900 dark:bg-slate-800" />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                <Image
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                  alt="A church congregation gathered in worship"
                  fill
                  priority
                  sizes="280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                    Grace Chapel
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">Welcome home.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {!reduce &&
            chips.map((chip) => (
              <motion.div
                key={chip.label}
                className="absolute z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/90"
                style={{ left: chip.x, top: chip.y }}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: chip.delay, ease: EASE }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                  <chip.icon className="h-4 w-4" />
                </span>
                <span className="pr-1">
                  <span className="block text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                    {chip.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{chip.sub}</span>
                </span>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
