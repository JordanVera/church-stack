'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#how', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Get started',
    links: [{ href: '/pricing', label: 'Register church' }],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { href: 'https://instagram.com', label: 'Instagram' },
      { href: 'https://facebook.com', label: 'Facebook' },
      { href: 'https://x.com', label: 'X' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white py-20  text-ink-950 dark:bg-ink-950 dark:text-white border-t border-ink-200/70 dark:border-ink-800/70">
      <div className="mx-auto max-w-6xl px-6">
        <Stagger className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <StaggerItem>
            <Image
              src="/brand/logo-horizontal.png"
              alt="Church Stack"
              width={220}
              height={110}
              className="h-24 w-auto brightness-0 dark:invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-white/50">
              Software that empowers ministry — branded church websites and owner tools for churches
              of every size.
            </p>
          </StaggerItem>

          {columns.map((col) => (
            <StaggerItem key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400 dark:text-white/40">
                {col.title}
              </p>
              <nav className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm font-medium text-ink-600 transition hover:text-ink-950 dark:text-white/70 dark:hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-8 text-xs text-ink-500 sm:flex-row dark:border-white/10 dark:text-white/40">
          <p>© {new Date().getFullYear()} Church Stack. Software that empowers ministry.</p>
          <p>Made for churches, by churches.</p>
        </div>
      </div>
    </footer>
  );
}
