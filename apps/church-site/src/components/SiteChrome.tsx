import type { ReactNode } from 'react';

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
  children: ReactNode;
};

export function SiteChrome({
  name,
  logoUrl,
  givingUrl,
  primaryColor,
  secondaryColor,
  showVisit = false,
  showBelong = false,
  contact,
  children,
}: SiteChromeProps) {
  const contactLine =
    [contact.address, contact.phone, contact.email].filter(Boolean).join(' · ') ||
    'Powered by Church Stack';

  return (
    <>
      <header className="site-anim-fade sticky top-0 z-40 border-b border-white/10 bg-[color-mix(in_srgb,var(--church-primary)_92%,#0f172a)] text-white backdrop-blur-md">
        <div className="mx-auto flex h-24 max-w-5xl items-center justify-between gap-4 px-6">
          <a href="#top" className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={name}
                className="h-[4.5rem] w-auto max-h-[4.5rem] max-w-[280px] object-contain sm:h-20 sm:max-h-20 sm:max-w-[320px]"
              />
            ) : (
              <span className="truncate font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight sm:text-base">
                {name}
              </span>
            )}
          </a>
          <nav className="flex items-center gap-4 text-sm">
            {showVisit ? (
              <a
                href="#visit"
                className="hidden text-white/80 transition hover:text-white sm:inline"
              >
                Visit
              </a>
            ) : null}
            {showBelong ? (
              <a
                href="#belong"
                className="hidden text-white/80 transition hover:text-white sm:inline"
              >
                Groups
              </a>
            ) : null}
            {givingUrl ? (
              <a
                href={givingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-stone-900 sm:text-sm"
                style={{ backgroundColor: secondaryColor }}
              >
                Give
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-stone-200 bg-stone-100/80 px-6 py-12 text-sm text-stone-600">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
            ) : null}
            <div>
              <p
                className="font-[family-name:var(--font-display)] text-base font-semibold text-stone-900"
                style={{ color: primaryColor }}
              >
                {name}
              </p>
              <p className="mt-0.5">{contactLine}</p>
            </div>
          </div>
          {givingUrl ? (
            <a
              href={givingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Give online
            </a>
          ) : null}
        </div>
      </footer>
    </>
  );
}
