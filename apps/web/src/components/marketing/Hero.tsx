'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bell, CalendarDays, HandHeart, Sparkles } from 'lucide-react';
import { LineReveal, Reveal } from '@/components/motion';

const EASE = [0.16, 1, 0.3, 1] as const;

const chips = [
  { icon: Bell, label: 'Lorem ipsum', sub: 'Dolor sit amet', x: '-10%', y: '12%', delay: 1.0 },
  { icon: CalendarDays, label: 'Consectetur', sub: 'Adipiscing • 7:00', x: '74%', y: '34%', delay: 1.2 },
  { icon: HandHeart, label: 'Give', sub: 'Sed do eiusmod', x: '-4%', y: '74%', delay: 1.4 },
];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Layered background: gradient wash, dotted grid, floating brand blobs. */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950/40 dark:via-slate-950 dark:to-slate-950" />
      <div className="absolute inset-0 -z-10 bg-grid text-slate-900/[0.05] dark:text-white/[0.06]" />
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

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-24">
        <div className="text-center lg:text-left">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-1.5 text-sm font-medium text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
          >
            <Sparkles className="h-4 w-4" />
            Lorem ipsum dolor sit
          </motion.span>

          <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] tracking-tight text-slate-900 sm:text-7xl lg:text-8xl dark:text-white">
            <LineReveal delay={0.1}>Build</LineReveal>
            <LineReveal delay={0.22}>beautiful</LineReveal>
            <LineReveal delay={0.34} className="text-brand-500 dark:text-brand-300">
              church apps.
            </LineReveal>
          </h1>

          <Reveal
            as="p"
            delay={0.5}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0 dark:text-slate-300"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua enim ad minim.
          </Reveal>

          <Reveal delay={0.62} className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-600/40"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#features"
              className="rounded-xl border border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Lorem ipsum
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
            {/* Glow behind device */}
            <div className="absolute inset-0 -z-10 scale-90 rounded-[3rem] bg-gradient-to-tr from-brand-500/40 to-accent-400/40 blur-3xl" />
            {/* Device frame */}
            <div className="relative mx-auto aspect-[9/19] w-[280px] rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-brand-900/30 dark:border-slate-800">
              <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900 dark:bg-slate-800" />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                <Image
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
                  alt="Congregation gathered in worship"
                  fill
                  priority
                  sizes="280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                    Lorem Ipsum
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold">Dolor sit amet.</p>
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
