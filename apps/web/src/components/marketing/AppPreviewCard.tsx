'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Radio, Users } from 'lucide-react';
import type { ReactNode } from 'react';
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
        className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-ink-950 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-semibold text-white/55">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="h-1 w-3.5 rounded-full bg-white/45" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          </div>
        </div>

        <div className="space-y-2.5 px-4 pb-5 pt-3">
          <Field
            label="Live now"
            value="Sunday Service"
            active
            reduce={reduce}
            trailing={
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            }
          />

          <Field label="Announcement" value="Youth retreat sign-ups open" hint="Posted 2m ago" />

          <Field
            label="This Sunday"
            value="Sunday Worship"
            hint="9:00 & 11:00 AM"
            trailing={
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                RSVP
              </span>
            }
          />

          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-white/45">Giving</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Building Fund</p>
            <p className="text-[11px] text-white/45">$12,480 of $20,000</p>
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

          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/45">
                  Sermon
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
                  Sunday&apos;s Message: Rooted
                </p>
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
              <span className="mt-3 shrink-0 text-[11px] font-medium text-white/50">24:10</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Groups" value="48" compact />
            <Field label="Events" value="12" compact />
            <Field label="Online" value="1.2k" compact />
          </div>

          <div className="mt-1 rounded-xl bg-brand-500 py-2.5 text-center text-xs font-bold text-white shadow-lg shadow-brand-900/40">
            Open your church app
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

function Field({
  label,
  value,
  hint,
  active,
  compact,
  reduce,
  trailing,
}: {
  label: string;
  value: string;
  hint?: string;
  active?: boolean;
  compact?: boolean;
  reduce?: boolean | null;
  trailing?: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border px-3 transition-colors ${compact ? 'py-2' : 'py-2.5'} ${
        active
          ? 'border-brand-400/70 bg-brand-500/15 ring-2 ring-brand-400/35'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
          <p className={`mt-0.5 font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
            {value}
            {active && !reduce && (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-px bg-brand-300"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-white/45">{hint}</p>}
        </div>
        {trailing && (
          <div className={`shrink-0 ${hint ? 'mt-3' : 'self-center'}`}>{trailing}</div>
        )}
      </div>
    </div>
  );
}
