import { SectionShell } from '@/components/SectionShell';

type Pastor = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  photoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
};

type Props = {
  pastors: Pastor[];
  accentColor: string;
};

const SOCIALS = [
  { key: 'facebookUrl' as const, label: 'Facebook' },
  { key: 'instagramUrl' as const, label: 'Instagram' },
  { key: 'youtubeUrl' as const, label: 'YouTube' },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 9.5v5l5-2.5-5-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  facebookUrl: FacebookIcon,
  instagramUrl: InstagramIcon,
  youtubeUrl: YouTubeIcon,
};

function PastorSocialLinks({ pastor }: { pastor: Pastor }) {
  const links = SOCIALS.flatMap(({ key, label }) => {
    const href = pastor[key]?.trim();
    return href ? [{ key, href, label, Icon: SOCIAL_ICONS[key] }] : [];
  });
  if (links.length === 0) return null;

  return (
    <ul className="mt-4 flex items-center justify-center gap-4">
      {links.map(({ key, href, label, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex text-[var(--site-fg)]/70 transition hover:text-[var(--site-fg)]"
          >
            <Icon className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PastorsSection({ pastors, accentColor }: Props) {
  if (pastors.length === 0) return null;

  return (
    <SectionShell id="team" tone="default">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          Leadership
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Our pastors
        </h2>
        <p className="mt-5 max-w-xl text-lg text-[var(--site-muted)]">
          The people who shepherd this church week to week.
        </p>

        <ul
          className={`mt-14 grid gap-10 ${
            pastors.length === 1
              ? 'mx-auto max-w-xs'
              : pastors.length === 2
                ? 'mx-auto max-w-2xl sm:grid-cols-2'
                : 'sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {pastors.map((pastor) => {
            const fullName = `${pastor.firstName} ${pastor.lastName}`.trim();
            return (
              <li key={pastor.id} className="mx-auto flex w-full max-w-[220px] flex-col gap-4">
                <div className="mx-auto aspect-[3/4] w-full max-w-[160px] overflow-hidden rounded-2xl bg-[var(--site-band-alt)] sm:max-w-[180px]">
                  {pastor.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pastor.photoUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center">
                      <span className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--site-muted)]">
                        {pastor.firstName.charAt(0)}
                        {pastor.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[var(--site-line)] bg-transparent px-5 py-6 text-center">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.04em] uppercase sm:text-xl">
                    {fullName}
                  </h3>
                  <p
                    className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: accentColor }}
                  >
                    {pastor.title}
                  </p>
                  <PastorSocialLinks pastor={pastor} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
