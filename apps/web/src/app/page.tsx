import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/marketing/Hero';
import LogoMarquee from '@/components/marketing/LogoMarquee';
import BigStatement from '@/components/marketing/BigStatement';
import Features from '@/components/marketing/Features';
import Showcase from '@/components/marketing/Showcase';
import HowItWorks from '@/components/marketing/HowItWorks';
import CTA from '@/components/marketing/CTA';

const footerLinks = [
  { href: '/#features', label: 'Lorem' },
  { href: '/#how', label: 'Ipsum' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/login', label: 'Log in' },
];

export default function HomePage() {
  return (
    <div>
      <Hero />
      <LogoMarquee />
      <BigStatement />
      <Features />
      <Showcase />
      <HowItWorks />
      <CTA />

      <footer className="border-t border-slate-200 py-14 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 sm:flex-row">
          <Image
            src="/brand/logo-vertical.png"
            alt="Church Stack"
            width={130}
            height={130}
            className="h-20 w-auto"
          />
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
        <div className="mx-auto mt-8 max-w-6xl px-6 text-center text-sm text-slate-400 sm:text-left dark:text-slate-500">
          © {new Date().getFullYear()} Church Stack. Lorem ipsum dolor sit amet.
        </div>
      </footer>
    </div>
  );
}
