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
    title: 'Account',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/signup', label: 'Get started' },
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
    <footer className="relative overflow-hidden bg-ink-950 pt-20 pb-10 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Stagger className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <StaggerItem>
            <Image
              src="/brand/logo-horizontal.png"
              alt="Church Stack"
              width={220}
              height={110}
              className="h-24 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">
              Software that empowers ministry — whitelabel iOS and Android apps for churches of
              every size.
            </p>
          </StaggerItem>

          {columns.map((col) => (
            <StaggerItem key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                {col.title}
              </p>
              <nav className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm font-medium text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Church Stack. Software that empowers ministry.</p>
          <p>Made for churches, by churches.</p>
        </Reveal>
      </div>
    </footer>
  );
}
