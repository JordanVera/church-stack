'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

type SocialLinks = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  threadsUrl: string | null;
};

type SiteChromeProps = {
  name: string;
  logoUrl: string | null;
  givingUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  showVisit?: boolean;
  showBelong?: boolean;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  social?: SocialLinks | null;
  children: React.ReactNode;
};

const SOCIAL_LABELS: Array<{ key: keyof SocialLinks; label: string }> = [
  { key: 'facebookUrl', label: 'Facebook' },
  { key: 'instagramUrl', label: 'Instagram' },
  { key: 'youtubeUrl', label: 'YouTube' },
  { key: 'threadsUrl', label: 'Threads' },
];

export function SiteChrome({
  name,
  logoUrl,
  givingUrl,
  primaryColor,
  secondaryColor,
  showVisit = false,
  showBelong = false,
  contact,
  social,
  children,
}: SiteChromeProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contactLine =
    [contact.address, contact.phone, contact.email].filter(Boolean).join(' · ') ||
    'Powered by Church Stack';

  const socialLinks = SOCIAL_LABELS.flatMap(({ key, label }) => {
    const href = social?.[key]?.trim();
    return href ? [{ href, label }] : [];
  });

  const onBrand = !scrolled;

  return (
    <>
      <header
        className={`site-anim-fade sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
          onBrand
            ? 'border-white/10 bg-[color-mix(in_srgb,var(--church-primary)_88%,#0f172a)] text-white'
            : 'border-[var(--site-line)] bg-[color-mix(in_srgb,var(--site-band)_88%,transparent)] text-[var(--site-fg)]'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6 sm:h-24">
          <a href="#top" className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={name}
                className="h-14 w-auto max-h-14 max-w-[240px] object-contain sm:h-16 sm:max-h-16 sm:max-w-[280px]"
              />
            ) : (
              <span className="truncate font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight sm:text-base">
                {name}
              </span>
            )}
          </a>
          <nav className="flex items-center gap-3 text-sm sm:gap-4">
            {showVisit ? (
              <a
                href="#visit"
                className={`hidden transition sm:inline ${
                  onBrand ? 'text-white/80 hover:text-white' : 'text-[var(--site-muted)] hover:text-[var(--site-fg)]'
                }`}
              >
                Visit
              </a>
            ) : null}
            {showBelong ? (
              <a
                href="#belong"
                className={`hidden transition sm:inline ${
                  onBrand ? 'text-white/80 hover:text-white' : 'text-[var(--site-muted)] hover:text-[var(--site-fg)]'
                }`}
              >
                Groups
              </a>
            ) : null}
            <ThemeToggle onBrand={onBrand} />
            {givingUrl ? (
              <a
                href={givingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-md px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                  onBrand ? 'text-stone-900' : 'text-white'
                }`}
                style={{ backgroundColor: onBrand ? secondaryColor : primaryColor }}
              >
                Give
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--site-line)] bg-[var(--site-band-alt)] px-6 py-16 text-sm text-[var(--site-muted)]">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="flex flex-col gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={name}
                className="h-16 w-auto max-h-16 max-w-[240px] object-contain"
              />
            ) : (
              <p
                className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight"
                style={{ color: primaryColor }}
              >
                {name}
              </p>
            )}
            <p className="max-w-md text-base leading-relaxed">{contactLine}</p>
            {socialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline-offset-4 transition hover:underline"
                      style={{ color: primaryColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            {givingUrl ? (
              <a
                href={givingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md px-5 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Give online
              </a>
            ) : null}
            <p className="text-xs text-[var(--site-muted)]">
              A community gathering around Jesus.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
