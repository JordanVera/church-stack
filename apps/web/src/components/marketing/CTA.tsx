'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-brand-600 px-8 py-16 text-center shadow-2xl shadow-brand-600/30"
      >
        {/* Decorative animated glow. */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to launch your church’s app?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Join churches shipping modern apps without the six-figure agency invoice.
          </p>
          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
