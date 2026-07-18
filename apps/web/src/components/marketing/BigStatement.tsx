'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Palette,
  Radio,
  Users,
  Wallet,
} from 'lucide-react';
import { LineReveal, Parallax, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/button';

const highlights = [
  {
    icon: MessageCircle,
    title: 'Built-in ways to connect',
    body: 'Chat with groups, register for events, check in kids, and give — the everyday moments that keep your people close.',
  },
  {
    icon: Palette,
    title: 'Make it unmistakably yours',
    body: 'Your logo, your colors, your name on the App Store — publish your own content without touching a line of code.',
  },
];

const floatingCards = [
  { icon: Users, label: 'Check-in', className: 'left-2 top-2 sm:left-4 sm:top-6', duration: 6 },
  {
    icon: MessageCircle,
    label: 'Group chat',
    className: 'right-0 top-16 sm:right-2 sm:top-20',
    duration: 7,
  },
  {
    icon: CalendarDays,
    label: 'Events',
    className: 'left-6 bottom-24 sm:left-10 sm:bottom-28',
    duration: 6.5,
  },
  {
    icon: Wallet,
    label: 'Give',
    className: 'right-4 bottom-4 sm:right-8 sm:bottom-8',
    duration: 8,
  },
];

export default function BigStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-slate-950 py-28 text-white sm:py-36">
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

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-10">
        <div>
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-300">
              Mobile app &amp; web management
            </p>
          </Reveal>

          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <LineReveal delay={0.05}>The app your</LineReveal>
            <LineReveal delay={0.15} className="text-brand-400">
              congregation
            </LineReveal>
            <LineReveal delay={0.25}>opens every Sunday.</LineReveal>
          </h2>

          <Reveal
            delay={0.35}
            as="p"
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/70"
          >
            Announcements, events, giving, and sermons — every real ministry moment lives in one
            place, perfectly in sync with your admin dashboard.
          </Reveal>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={0.45 + i * 0.1}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                  <h.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-white">
                  {h.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{h.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.65} className="mt-10">
            <Button
              size="lg"
              className="group h-auto rounded-full bg-white px-7 py-3.5 text-sm uppercase tracking-widest text-slate-900 shadow-lg hover:bg-white/90"
              render={<Link href="/signup" />}
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.3} y={32} className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          <Parallax speed={44} className="h-full">
            <div className="relative h-full w-full">
              {!reduce && (
                <motion.div
                  aria-hidden
                  className="absolute inset-10 rounded-full opacity-30 blur-2xl"
                  style={{
                    background:
                      'conic-gradient(from 0deg, var(--color-brand-400), var(--color-accent-400), var(--color-brand-500), var(--color-brand-400))',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                />
              )}

              <div className="absolute inset-16 rounded-full border border-white/10 sm:inset-20" />

              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Radio className="h-4 w-4" />
              </div>

              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  className={`absolute flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-lg shadow-slate-950/40 backdrop-blur-sm ${card.className}`}
                  animate={reduce ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: card.duration, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <card.icon className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold text-white/80">
                    {card.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
