'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { dashboardNav } from '@/components/dashboard/DashboardShell';
import { cn } from '@/lib/utils';

function dashboardSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/dashboard\/([^/]+)/);
  return match?.[1] ?? null;
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = status === 'authenticated';
  const slug = dashboardSlugFromPath(pathname);
  const navItems = useMemo(() => (slug ? dashboardNav(slug) : []), [slug]);

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
            ? 'border-b backdrop-blur-md border-ink-200/70 bg-white/80 dark:border-ink-800/70 dark:bg-ink-950/80'
            : 'border-b backdrop-blur-sm border-ink-200/50 bg-white/70 dark:border-ink-800/50 dark:bg-ink-950/70'
        }`}
      >
        <div className="flex justify-between items-center px-6 mx-auto max-w-7xl h-16 md:h-20">
          <div className="flex gap-6 items-center min-w-0">
            <Link href="/" className="flex items-center group shrink-0" onClick={closeMenu}>
              <Image
                src="/brand/gatherly-logo-horizontal.png"
                alt="Gatherly Stack"
                width={220}
                height={110}
                priority
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-[1.03] brightness-0 md:h-10 dark:invert"
              />
            </Link>
          </div>

          <div className="flex gap-2 items-center sm:gap-4">
            <ThemeToggle />
            <div className="hidden gap-3 items-center sm:gap-4 md:flex">
              {signedIn ? (
                <>
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded-full border-ink-300 px-4 py-2.5 text-xs uppercase tracking-[0.15em] dark:border-ink-600"
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
              aria-controls="dashboard-mobile-nav"
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
            key="dashboard-mobile-nav-backdrop"
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-ink-950/40 backdrop-blur-sm lg:hidden dark:bg-black/50"
            onClick={closeMenu}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            key="dashboard-mobile-nav-panel"
            id="dashboard-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(20rem,88vw)] flex-col border-l border-ink-200/70 bg-white shadow-xl lg:hidden dark:border-ink-800/70 dark:bg-ink-950"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-ink-200/70 dark:border-ink-800/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">
                Dashboard
              </p>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={closeMenu}>
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex overflow-y-auto flex-col flex-1 gap-1 px-4 py-5">
              {navItems.length > 0 ? (
                navItems.map((item) => {
                  const active =
                    item.href === `/dashboard/${slug}`
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'flex gap-2 items-center px-3 py-3 text-sm font-semibold rounded-lg transition',
                        active
                          ? 'bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                          : 'text-ink-700 hover:bg-ink-100/70 dark:text-ink-200 dark:hover:bg-ink-900/60'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })
              ) : (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="px-3 py-3 text-sm font-semibold rounded-lg transition text-ink-700 hover:bg-ink-100/70 dark:text-ink-200 dark:hover:bg-ink-900/60"
                >
                  All churches
                </Link>
              )}

              <div className="flex flex-col gap-2 pt-5 mt-auto border-t border-ink-200/70 dark:border-ink-800/70">
                {signedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                      render={<Link href="/dashboard" onClick={closeMenu} />}
                    >
                      All churches
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer rounded-full border-ink-300 px-4 py-2.5 text-xs uppercase tracking-[0.15em] dark:border-ink-600"
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
                      className="cursor-pointer justify-start px-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                      render={<Link href="/login?callbackUrl=/dashboard" onClick={closeMenu} />}
                    >
                      Log in
                    </Button>
                    <Button
                      className="cursor-pointer rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] shadow-sm shadow-brand-600/30"
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
