'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Counter, LineReveal, Reveal } from '@/components/motion';
import Particles from '@/components/marketing/Particles';
import AppPreviewCard from '@/components/marketing/AppPreviewCard';

const stats = [
  { value: 14, suffix: 'd', label: 'Idea to launch' },
  { value: 2, suffix: '', label: 'App stores, one build' },
  { value: 100, suffix: '%', label: 'Whitelabeled to you' },
];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-14 sm:pt-28 lg:pt-20 lg:pb-10 dark:bg-slate-950">
      {/* Dotted grid + constellation particles behind everything */}
      <div className="absolute inset-0 -z-20 bg-grid text-slate-900/4 dark:text-white/5" />
      <Particles
        className="pointer-events-none absolute inset-0 -z-10 text-brand-500/70 dark:text-brand-300/50"
        density={8500}
        maxLinkDistance={130}
      />

      {/* Ambient brand glows, matching the rest of the site's language */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-32 top-0 -z-10 h-112 w-md rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-500/15"
            animate={{ y: [0, 30, 0], x: [0, 16, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-24 bottom-0 -z-10 h-104 w-104 rounded-full bg-accent-400/15 blur-3xl dark:bg-accent-500/15"
            animate={{ y: [0, -24, 0], x: [0, -14, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}

      {/* Fade to solid background at the edges so text stays crisp over the particles */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 30%, transparent 0%, transparent 45%, white 85%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 30%, transparent 0%, transparent 45%, #020617 85%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-6">
        <div className="lg:max-w-xl">
          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              iOS &amp; Android &middot; no code required
            </span>
          </Reveal>

          <h1 className="relative z-10 mt-4 font-hero uppercase leading-[0.92] tracking-tight text-slate-900 sm:mt-5 lg:mt-3 dark:text-white text-[clamp(3rem,11vw,8rem)]">
            <LineReveal eager delay={0.15}>
              Your church.
            </LineReveal>
            <LineReveal eager delay={0.28} className="text-brand-500 dark:text-brand-400">
              Your app.
            </LineReveal>
            <LineReveal eager delay={0.41}>
              Live in days.
            </LineReveal>
          </h1>

          <Reveal
            delay={0.55}
            as="p"
            className="relative z-10 mt-5 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl lg:mt-4 lg:max-w-md lg:text-lg dark:text-slate-300"
          >
            Church Stack turns your branding into a fully whitelabeled iOS and Android app —
            announcements, events, giving, and sermons, ready before your next Sunday.
          </Reveal>

          <Reveal
            delay={0.7}
            className="relative z-10 mt-7 flex flex-wrap items-center gap-4 lg:mt-6"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-600/40"
            >
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#features"
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
            >
              See how it works
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>

          <div className="relative z-10 mt-9 grid grid-cols-3 gap-6 border-t border-slate-200 pt-6 sm:max-w-xl lg:mt-7 lg:max-w-md lg:gap-4 lg:pt-5 dark:border-slate-800">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={0.8 + i * 0.1}>
                <p className="font-display text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl lg:text-3xl dark:text-white">
                  <Counter value={stat.value} suffix={stat.suffix} duration={1.4} />
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.35} y={32} className="hidden lg:block">
          <AppPreviewCard />
        </Reveal>
      </div>
    </section>
  );
}
