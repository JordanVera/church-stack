'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Counter, Parallax, Reveal } from '@/components/motion';
import { Button } from '@/components/ui/button';

const stats = [
  { value: 3, suffix: ' days', label: 'From sign-up to a live app in both stores' },
  { value: 2, suffix: ' stores', label: 'iOS and Android, published under your name' },
  { value: 1, suffix: ' dashboard', label: 'For every announcement, event, and gift' },
];

export default function Showcase() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 ">
      <div className="grid items-stretch lg:grid-cols-2">
        <Parallax speed={30} className="relative min-h-[380px] lg:min-h-[640px]">
          <div className="absolute inset-0">
            <Image
              src="/marketing/showcase-community-steps.jpg"
              alt="Community gathering on the steps of a modern church"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/30 via-transparent to-transparent lg:hidden" />
          </div>
        </Parallax>

        <div className="relative flex items-center bg-white px-6 py-16 sm:px-12 lg:-ml-16 lg:rounded-l-[2.5rem] lg:py-0 lg:shadow-2xl lg:shadow-ink-900/10 dark:bg-ink-950 dark:lg:shadow-black/40">
          <div className="mx-auto max-w-lg lg:mx-0 lg:ml-16">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand-500 dark:text-brand-400">
                Why churches switch
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
                Built for how churches work
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-600 dark:text-ink-300">
                No dev team, no agency retainer. Your staff manages announcements, events, and
                giving from one dashboard, and it shows up instantly in an app that looks and feels
                like it was built in-house.
              </p>
            </Reveal>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-ink-200 pt-8 dark:border-ink-800">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.1}>
                  <dt className="font-display text-2xl font-bold text-brand-600 dark:text-brand-300">
                    <Counter value={s.value} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-ink-500 dark:text-ink-400">
                    {s.label}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={0.2}>
              <Button
                variant="outline"
                size="lg"
                className="mt-9 h-auto rounded-xl border-ink-300 px-6 py-3.5 text-base text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:bg-transparent dark:text-ink-200 dark:hover:bg-ink-800"
                render={<Link href="/pricing" />}
              >
                View pricing
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
