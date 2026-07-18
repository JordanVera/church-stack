'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, CalendarDays, Megaphone, PlayCircle, Radio, Users, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const waveform = [4, 8, 5, 10, 6, 9, 4, 7, 5, 6];

/**
 * Abstract, code-drawn preview of the whitelabeled app — no stock photography,
 * just floating UI chrome built from divs/icons so it stays crisp at any size
 * and adapts to light/dark automatically.
 */
export default function AppPreviewCard() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute -inset-8 -z-10 rounded-[3rem] opacity-30 blur-2xl"
          style={{
            background:
              'conic-gradient(from 0deg, var(--color-brand-400), var(--color-accent-400), var(--color-brand-500), var(--color-brand-400))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <motion.div
        className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-ink-900 shadow-2xl shadow-ink-900/40"
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 text-[11px] font-semibold text-white/70">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-4 rounded-full bg-white/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
              FB
            </div>
            <div>
              <p className="text-sm font-semibold text-white">First Baptist</p>
              <p className="text-[11px] text-white/50">Good morning</p>
            </div>
          </div>
          <Bell className="h-4 w-4 text-white/60" />
        </div>

        <div className="mt-5 space-y-2.5 px-4 pb-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Live now &middot; Sunday Service
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Youth retreat sign-ups open</p>
              <p className="text-[11px] text-white/50">Posted 2m ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">Sunday Worship</p>
              <p className="text-[11px] text-white/50">Sun &middot; 9:00 &amp; 11:00 AM</p>
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
              RSVP
            </span>
          </div>

          <div className="rounded-2xl bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Building Fund</p>
                <p className="text-[11px] text-white/50">$12,480 of $20,000</p>
              </div>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-accent-400"
                initial={{ width: 0 }}
                whileInView={{ width: '62%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <PlayCircle className="h-8 w-8 shrink-0 text-white/80" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">Sunday&apos;s Message: Rooted</p>
              <div className="mt-1.5 flex h-3 items-end gap-0.5">
                {waveform.map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full bg-white/30"
                    style={{ height: `${h * 2}px` }}
                  />
                ))}
              </div>
            </div>
            <span className="text-[11px] font-medium text-white/50">24:10</span>
          </div>
        </div>
      </motion.div>

      {!reduce && (
        <>
          <motion.div
            className="absolute -left-10 top-8 hidden sm:block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Badge
              variant="outline"
              className="h-auto gap-2 rounded-2xl border-ink-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-700 shadow-lg dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
            >
              <Radio className="h-4 w-4 text-brand-500" />
              2 platforms, 1 app
            </Badge>
          </motion.div>
          <motion.div
            className="absolute -right-8 bottom-14 hidden sm:block"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Badge
              variant="outline"
              className="h-auto gap-2 rounded-2xl border-ink-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-700 shadow-lg dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
            >
              <Users className="h-4 w-4 text-accent-500" />
              1,204 members active
            </Badge>
          </motion.div>
        </>
      )}
    </div>
  );
}
