'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

export default function Header() {
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const signedIn = status === 'authenticated';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-ink-200/70 bg-white/80 backdrop-blur-md dark:border-ink-800/70 dark:bg-ink-950/80'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center">
          <Image
            src="/brand/logo-horizontal.png"
            alt="Church Stack"
            width={220}
            height={110}
            priority
            className="h-24 w-auto transition-transform duration-300 group-hover:scale-[1.03] brightness-0 dark:invert"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 transition hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          {signedIn ? (
            <>
              <Button
                variant="ghost"
                className="hidden rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-ink-700 sm:inline-flex dark:text-ink-200"
                render={<Link href="/dashboard" />}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-ink-300 px-4 py-2.5 text-xs uppercase tracking-[0.15em] dark:border-ink-600"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Log out
              </Button>
            </>
          ) : status !== 'loading' ? (
            <Button
              variant="ghost"
              className="rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-ink-700 dark:text-ink-200"
              render={<Link href="/login?callbackUrl=/dashboard" />}
            >
              Log in
            </Button>
          ) : null}
          {!signedIn ? (
            <Button
              className="rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] shadow-sm shadow-brand-600/30 hover:shadow-md hover:shadow-brand-600/40"
              render={<Link href="/pricing" />}
            >
              Register church
            </Button>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
