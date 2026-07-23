import { SectionShell } from '@/components/SectionShell';

type Announcement = {
  id: string;
  title: string;
  body: string;
};

type Props = {
  announcements: Announcement[];
  accentColor: string;
};

export function AnnouncementsSection({ announcements, accentColor }: Props) {
  if (announcements.length === 0) return null;

  const [featured, ...rest] = announcements;

  return (
    <SectionShell tone="default">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          News
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Announcements
        </h2>

        {featured ? (
          <article className="mt-14 border-l-4 pl-6 sm:pl-8" style={{ borderColor: accentColor }}>
            <h3 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              {featured.title}
            </h3>
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-lg leading-relaxed text-[var(--site-muted)]">
              {featured.body}
            </p>
          </article>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-14 space-y-10 border-t border-[var(--site-line)] pt-10">
            {rest.map((a) => (
              <li key={a.id}>
                <h3 className="text-2xl font-semibold tracking-tight">{a.title}</h3>
                <p className="mt-3 max-w-2xl whitespace-pre-wrap leading-relaxed text-[var(--site-muted)]">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionShell>
  );
}
