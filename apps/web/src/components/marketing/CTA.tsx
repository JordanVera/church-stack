'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { LineReveal, Reveal } from '@/components/motion';
import Particles from '@/components/marketing/Particles';
import { Button } from '@/components/ui/button';

export default function CTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-brand-50 py-32 text-ink-900 dark:bg-ink-950 dark:text-white">
      {/* Atmosphere — brand wash + warm accent, matching Planning Center language */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.22),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(245,176,122,0.2),transparent_50%),radial-gradient(ellipse_at_10%_85%,rgba(132,220,207,0.14),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.5),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(245,176,122,0.3),transparent_50%),radial-gradient(ellipse_at_10%_85%,rgba(132,220,207,0.18),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,24,28,0.08)_1px,transparent_0)] bg-size-[28px_28px] opacity-60 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] dark:opacity-[0.35]"
      />
      <Particles className="pointer-events-none absolute inset-0" density={10000} />

      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-500/35"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-28 bottom-0 h-112 w-md rounded-full bg-[#f5b07a]/25 blur-3xl dark:bg-[#f5b07a]/28"
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [1.1, 1, 1.1], y: [0, -18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-0 h-64 w-xl -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-400/20"
            animate={{ opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Vignette so the headline stays crisp over the particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 50% 45%, transparent 0%, transparent 42%, rgba(242,250,253,0.85) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 50% 45%, transparent 0%, transparent 42%, rgba(34,24,28,0.7) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-300">
            Start this week
          </p>
        </Reveal>

        <h2 className="mx-auto mt-6 max-w-5xl font-hero uppercase leading-[0.9] tracking-tight text-ink-900 text-[clamp(2.75rem,10vw,7.5rem)] dark:text-white">
          <LineReveal>Your church</LineReveal>
          <LineReveal delay={0.1} className="text-brand-500 dark:text-brand-400">
            deserves an app
          </LineReveal>
          <LineReveal delay={0.2}>that looks like you.</LineReveal>
        </h2>

        <Reveal
          delay={0.35}
          as="p"
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-600 sm:mt-10 sm:text-xl dark:text-white/65"
        >
          Whitelabeled iOS and Android — announcements, events, giving, and sermons — live before
          your next Sunday. No developers. No agency invoice.
        </Reveal>

        <Reveal
          delay={0.45}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14"
        >
          <Button
            size="lg"
            className="group h-auto rounded-full px-8 py-4 text-sm uppercase tracking-widest shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35"
            render={<Link href="/onboard" />}
          >
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="group h-auto rounded-full border-ink-200 bg-white/70 px-8 py-4 text-sm uppercase tracking-widest text-ink-700 backdrop-blur-sm hover:border-ink-300 hover:bg-white dark:border-white/25 dark:bg-transparent dark:text-white dark:hover:border-white/45 dark:hover:bg-white/5"
            render={<Link href="/#how" />}
          >
            See how it works
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </Reveal>

        <Reveal delay={0.55}>
          <p className="mt-12 text-xs font-medium uppercase tracking-[0.2em] ">
            iOS &amp; Android · Live in days
          </p>
        </Reveal>
      </div>
    </section>
  );
}
