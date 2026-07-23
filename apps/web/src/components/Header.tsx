'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = status === 'authenticated';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20">
          <Link href="/" className="group flex items-center" onClick={closeMenu}>
            <Image
              src="/brand/logo-horizontal.png"
              alt="Church Stack"
              width={220}
              height={110}
              priority
              className="h-16 w-auto transition-transform duration-300 group-hover:scale-[1.03] brightness-0 md:h-24 dark:invert"
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

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div className="hidden items-center gap-3 sm:gap-4 md:flex">
              {signedIn ? (
                <>
                  <Button
                    variant="ghost"
                    className="px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
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
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                    render={<Link href="/login?callbackUrl=/dashboard" />}
                  >
                    Log in
                  </Button>
                  <Button
                    className="rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] shadow-sm shadow-brand-600/30 hover:shadow-md hover:shadow-brand-600/40"
                    render={<Link href="/pricing" />}
                  >
                    Register church
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-ink-950/40 backdrop-blur-sm md:hidden dark:bg-black/50"
            onClick={closeMenu}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            key="mobile-nav-panel"
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(20rem,88vw)] flex-col border-l border-ink-200/70 bg-white shadow-xl md:hidden dark:border-ink-800/70 dark:bg-ink-950"
          >
            <div className="flex items-center justify-between border-b border-ink-200/70 px-5 py-4 dark:border-ink-800/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
                Menu
              </p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-700 transition hover:bg-ink-100/70 dark:text-ink-200 dark:hover:bg-ink-900/60"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-auto flex flex-col gap-2 border-t border-ink-200/70 pt-5 dark:border-ink-800/70">
                {signedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                      render={<Link href="/dashboard" onClick={closeMenu} />}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-ink-300 px-4 py-2.5 text-xs uppercase tracking-[0.15em] dark:border-ink-600"
                      onClick={() => {
                        closeMenu();
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                      render={
                        <Link href="/login?callbackUrl=/dashboard" onClick={closeMenu} />
                      }
                    >
                      Log in
                    </Button>
                    <Button
                      className="rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] shadow-sm shadow-brand-600/30"
                      render={<Link href="/pricing" onClick={closeMenu} />}
                    >
                      Register church
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
