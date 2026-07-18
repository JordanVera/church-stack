import Link from 'next/link';
import Hero from '@/components/marketing/Hero';
import LogoMarquee from '@/components/marketing/LogoMarquee';
import Features from '@/components/marketing/Features';
import Showcase from '@/components/marketing/Showcase';
import HowItWorks from '@/components/marketing/HowItWorks';
import CTA from '@/components/marketing/CTA';

const footerLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/login', label: 'Log in' },
];

export default function HomePage() {
  return (
    <div>
      <Hero />
      <LogoMarquee />
      <Features />
      <Showcase />
      <HowItWorks />
      <CTA />

      <footer className="border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-display text-white">
              C
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Church Stack
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mx-auto mt-8 max-w-6xl px-6 text-sm text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Church Stack. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
