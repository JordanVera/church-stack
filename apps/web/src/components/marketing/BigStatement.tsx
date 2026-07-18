'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { LineReveal, Parallax } from '@/components/motion';

export default function BigStatement() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.3, 1, 1, 0.3]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-slate-950 py-32 text-white sm:py-40">
      {/* Ambient brand glows */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-accent-500/20 blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Faint logo watermark */}
      <Parallax
        speed={40}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/brand/logo-vertical.png"
          alt=""
          aria-hidden
          width={520}
          height={520}
          className="w-[70%] max-w-2xl opacity-[0.06]"
        />
      </Parallax>

      <motion.div
        className="relative mx-auto max-w-6xl px-6"
        style={reduce ? undefined : { scale, opacity }}
      >
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-[0.3em] text-brand-300">
          Our mission
        </p>
        <h2 className="text-center font-display text-6xl font-bold leading-[0.9] tracking-tight sm:text-8xl lg:text-[9rem]">
          <LineReveal delay={0.05}>until</LineReveal>
          <LineReveal delay={0.15} className="text-brand-400">
            every
          </LineReveal>
          <LineReveal delay={0.25}>church</LineReveal>
          <LineReveal delay={0.35}>connects.</LineReveal>
        </h2>
      </motion.div>
    </section>
  );
}
