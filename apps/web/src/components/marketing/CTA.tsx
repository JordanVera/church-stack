'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LineReveal } from '@/components/motion';

export default function CTA() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-20 text-center shadow-2xl shadow-brand-600/30 sm:py-24"
      >
        {!reduce && (
          <>
            <motion.div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/20 blur-2xl"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
        <div className="relative">
          <h2 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
            <LineReveal>Ready to launch?</LineReveal>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-brand-100">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </p>
          <Link
            href="/signup"
            className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
