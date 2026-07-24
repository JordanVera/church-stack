import { SectionShell } from '@/components/SectionShell';

type Pastor = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
};

type Props = {
  pastors: Pastor[];
  accentColor: string;
};

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

        <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {pastors.map((pastor) => (
            <li key={pastor.id} className="border-t border-[var(--site-line)] pt-8">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
                {pastor.firstName} {pastor.lastName}
              </h3>
              <p
                className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]"
                style={{ color: accentColor }}
              >
                {pastor.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
