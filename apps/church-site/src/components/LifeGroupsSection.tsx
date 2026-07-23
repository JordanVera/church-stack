import { formatMeetingDay, formatServiceTime } from '@/lib/format';
import { SectionShell } from '@/components/SectionShell';

type LifeGroup = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  meetingDay: number | null;
  meetingTime: string | null;
};

type Props = {
  groups: LifeGroup[];
  accentColor: string;
};

export function LifeGroupsSection({ groups, accentColor }: Props) {
  if (groups.length === 0) return null;

  return (
    <SectionShell id="belong" tone="alt">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            Belong
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Life groups
          </h2>
          <p className="mt-5 max-w-sm text-lg text-[var(--site-muted)]">
            Find a smaller community for prayer, friendship, and growing in faith.
          </p>
        </div>

        <ul className="space-y-12">
          {groups.map((group) => {
            const day = formatMeetingDay(group.meetingDay);
            const time = group.meetingTime ? formatServiceTime(group.meetingTime) : null;
            const when = [day, time].filter(Boolean).join(' · ');

            return (
              <li key={group.id} className="border-t border-[var(--site-line)] pt-8 first:border-t-0 first:pt-0">
                <h3 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                  {group.name}
                </h3>
                {when || group.location ? (
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: accentColor }}>
                    {[when, group.location].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {group.description ? (
                  <p className="mt-4 max-w-xl whitespace-pre-wrap text-base leading-relaxed text-[var(--site-muted)]">
                    {group.description}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
