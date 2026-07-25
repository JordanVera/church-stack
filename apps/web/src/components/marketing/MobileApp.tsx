'use client';

import { motion, useReducedMotion } from 'framer-motion';
import AppStoreButton from '@/components/buttons/AppStoreButton';
import PlayStoreButton from '@/components/buttons/PlayStoreButton';
import AppPreviewCard from '@/components/marketing/AppPreviewCard';
import { Reveal } from '@/components/motion';

export default function MobileApp() {
  const reduce = useReducedMotion();

  return (
    <section id="mobile-app" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          {/* Gradient border shell */}
          <div
            className="rounded-[2rem] p-px shadow-2xl shadow-brand-900/20"
            style={{
              background:
                'linear-gradient(135deg, #34d399 0%, #55bae8 35%, #a78bfa 65%, #f4a5c8 85%, #f5b07a 100%)',
            }}
          >
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-ink-950 px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
              {/* Atmosphere */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(52,211,153,0.16),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(244,165,200,0.14),transparent_50%),radial-gradient(ellipse_at_70%_10%,rgba(85,186,232,0.12),transparent_40%)]"
              />
              {!reduce && (
                <>
                  <motion.div
                    aria-hidden
                    className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl"
                    animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    aria-hidden
                    className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#f4a5c8]/15 blur-3xl"
                    animate={{ opacity: [0.25, 0.5, 0.25], y: [0, -12, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  />
                </>
              )}

              <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                <div className="max-w-xl">
                  <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                    Take{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, #68d4c4 0%, #55bae8 40%, #a78bfa 70%, #f5b07a 100%)',
                      }}
                    >
                      Your Church
                    </span>{' '}
                    with you everywhere
                  </h2>

                  <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
                    Stream services, stay connected with your community, give online, and access
                    exclusive content — all from the palm of your hand.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <AppStoreButton className="bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black" />
                    <PlayStoreButton className="bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black" />
                  </div>
                </div>

                <div className="mx-auto w-full max-w-70 sm:max-w-xs lg:max-w-sm">
                  <AppPreviewCard showFloatBadges={false} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
