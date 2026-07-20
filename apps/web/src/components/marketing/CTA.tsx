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
    <section className="relative overflow-hidden bg-ink-950 py-32 text-white sm:py-40 lg:py-48">
      {/* Atmosphere — brand wash + warm accent, matching Planning Center language */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(26,139,189,0.5),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(245,176,122,0.3),transparent_50%),radial-gradient(ellipse_at_10%_85%,rgba(132,220,207,0.18),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] bg-size-[28px_28px] opacity-[0.35]"
      />
      <Particles
        className="pointer-events-none absolute inset-0 text-brand-300/45"
        density={10000}
        maxLinkDistance={120}
      />

      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-500/35 blur-3xl"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-28 bottom-0 h-112 w-md rounded-full bg-[#f5b07a]/28 blur-3xl"
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [1.1, 1, 1.1], y: [0, -18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-0 h-64 w-xl -translate-x-1/2 rounded-full bg-brand-400/20 blur-3xl"
            animate={{ opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Vignette so the headline stays crisp over the particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 50% 45%, transparent 0%, transparent 42%, rgba(34,24,28,0.7) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-300">
            Start this week
          </p>
        </Reveal>

        <h2 className="mx-auto mt-6 max-w-5xl font-hero uppercase leading-[0.9] tracking-tight text-[clamp(2.75rem,10vw,7.5rem)]">
          <LineReveal>Your church</LineReveal>
          <LineReveal delay={0.1} className="text-brand-400">
            deserves an app
          </LineReveal>
          <LineReveal delay={0.2}>that looks like you.</LineReveal>
        </h2>

        <Reveal
          delay={0.35}
          as="p"
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/65 sm:mt-10 sm:text-xl"
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
            className="group h-auto rounded-full bg-white px-8 py-4 text-sm uppercase tracking-widest text-ink-900 shadow-lg shadow-black/40 hover:bg-brand-50 hover:shadow-xl hover:shadow-brand-500/20"
            render={<Link href="/signup" />}
          >
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="group h-auto rounded-full border-white/25 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-white hover:border-white/45 hover:bg-white/5"
            render={<Link href="/#how" />}
          >
            See how it works
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </Reveal>

        <Reveal delay={0.55}>
          <p className="mt-12 text-xs font-medium uppercase tracking-[0.2em] text-white">
            iOS &amp; Android · Live in days
          </p>
        </Reveal>
      </div>
    </section>
  );
}
