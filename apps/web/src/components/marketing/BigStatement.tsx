'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Smartphone,
  User,
} from 'lucide-react';
import { LineReveal, Reveal } from '@/components/motion';

export default function BigStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-950 py-28 text-white sm:py-36">
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"
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

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal
          delay={0.35}
          as="p"
          className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-white/70"
        >
          Every profile update, form submission, and gift is captured the moment it happens — no
          exports, no manual entry, no waiting.
        </Reveal>
      </div>

      <div className="relative mt-16 grid gap-4 px-4 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:px-12">
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute top-1/2 z-10 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_4px_rgba(255,255,255,0.8)] sm:block"
            initial={{ left: '2%', opacity: 0 }}
            animate={{ left: ['2%', '98%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
          />
        )}

        {/* Member app — where updates happen */}
        <Reveal delay={0.1} className="sm:col-span-1">
          <div className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-400 via-brand-500 to-accent-400 p-10 pb-24 sm:min-h-[560px] sm:p-14 sm:pb-28 lg:min-h-[640px] lg:p-16 lg:pb-32">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-brand-600 shadow-sm lg:h-12 lg:w-12">
                <Smartphone className="h-5.5 w-5.5" />
              </div>
              <span className="font-display text-2xl font-bold text-white lg:text-3xl">
                your church
              </span>
            </div>
            <p className="mt-2 text-base font-medium text-white/85 lg:text-lg">
              Updates happen here…
            </p>

            <motion.div
              className="relative mx-auto mt-10 w-[85%] max-w-sm origin-bottom rounded-[2rem] border border-white/40 bg-white p-6 text-ink-900 shadow-2xl sm:mt-12 lg:mt-14 lg:max-w-md lg:p-8"
              initial={reduce ? undefined : { rotate: -7 }}
              animate={reduce ? undefined : { rotate: [-7, -4, -7], y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-sm font-semibold text-ink-500">Update your info</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-ink-100 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                    Name
                  </p>
                  <p className="text-base font-semibold text-ink-800">Hannah Barnes</p>
                </div>
                <div className="rounded-xl bg-ink-100 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                    Address
                  </p>
                  <p className="text-base font-semibold text-ink-800">1472 Alderwood Ln</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['City', 'State', 'Zip'].map((f) => (
                    <div key={f} className="rounded-xl bg-ink-100 px-3 py-2.5">
                      <p className="text-[10px] font-medium text-ink-400">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <RefreshButton />
          </div>
        </Reveal>

        {/* Admin dashboard — where it shows up */}
        <Reveal delay={0.2} className="sm:col-span-2">
          <div className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[2rem] bg-linear-to-br from-accent-300 via-accent-400 to-brand-300 p-10 pb-24 sm:min-h-[560px] sm:p-14 sm:pb-28 lg:min-h-[640px] lg:p-16 lg:pb-32">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-accent-700 shadow-sm lg:h-12 lg:w-12">
                <ClipboardList className="h-5.5 w-5.5" />
              </div>
              <span className="font-display text-2xl font-bold text-white lg:text-3xl">
                dashboard
              </span>
            </div>
            <p className="mt-2 text-base font-medium text-white/85 lg:text-lg">Shows up here.</p>

            <motion.div
              className="mx-auto mt-10 flex w-[85%] max-w-md overflow-hidden rounded-[1.75rem] border border-white/40 bg-white text-ink-900 shadow-2xl sm:mt-12 lg:mt-14 lg:max-w-lg"
              initial={reduce ? undefined : { y: 0 }}
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <div className="flex-1 p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      HB
                    </div>
                    <p className="text-base font-semibold text-ink-800">Hannah Barnes</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-medium text-ink-500">
                    Actions <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-ink-500">
                    <Mail className="h-4 w-4" />
                    <span className="h-2 flex-1 rounded-full bg-ink-100" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-500">
                    <Phone className="h-4 w-4" />
                    <span className="h-2 w-24 rounded-full bg-ink-100" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium text-ink-600">1472 Alderwood Ln</span>
                  </div>
                </div>
              </div>

              <div className="flex w-14 flex-col items-center gap-5 border-l border-ink-100 bg-ink-50 py-6 lg:w-16">
                <User className="h-5 w-5 text-ink-400" />
                <HelpCircle className="h-5 w-5 text-ink-400" />
                <span className="relative">
                  <Bell className="h-5 w-5 text-ink-400" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-600" />
                </span>
                <MessageSquare className="h-5 w-5 text-ink-400" />
                <ClipboardList className="h-5 w-5 text-ink-400" />
              </div>
            </motion.div>

            <RefreshButton delay={0.6} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RefreshButton({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-md lg:h-12 lg:w-12"
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay }}
    >
      <RefreshCw className="h-4.5 w-4.5" />
    </motion.div>
  );
}
