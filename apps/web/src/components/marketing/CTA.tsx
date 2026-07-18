'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LineReveal, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/button';

export default function CTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-brand-600 to-brand-800 py-28 text-center sm:py-36">
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
      <div className="relative mx-auto max-w-4xl px-6">
        <h2 className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
          <LineReveal>Ready to</LineReveal>
          <LineReveal delay={0.1}>launch your app?</LineReveal>
        </h2>
        <Reveal delay={0.3} as="p" className="mx-auto mt-6 max-w-xl text-lg text-brand-100">
          Join churches already using Church Stack to reach their congregation — no developers
          required, no agency invoices.
        </Reveal>
        <Reveal delay={0.4}>
          <Button
            size="lg"
            className="group mt-10 h-auto rounded-full bg-white px-8 py-4 text-base text-brand-700 shadow-lg hover:bg-brand-50"
            render={<Link href="/signup" />}
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
