import { formatMeetingDay, formatServiceTime } from '@/lib/format';

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
    <section id="belong" className="border-y border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          Belong
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
          Life groups
        </h2>
        <p className="mt-3 max-w-xl text-stone-600">
          Find a smaller community for prayer, friendship, and growing in faith.
        </p>

        <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
          {groups.map((group) => {
            const day = formatMeetingDay(group.meetingDay);
            const time = group.meetingTime ? formatServiceTime(group.meetingTime) : null;
            const when = [day, time].filter(Boolean).join(' · ');

            return (
              <li key={group.id} className="py-7">
                <h3 className="text-xl font-semibold text-stone-900">{group.name}</h3>
                {when || group.location ? (
                  <p className="mt-1.5 text-sm font-medium" style={{ color: accentColor }}>
                    {[when, group.location].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {group.description ? (
                  <p className="mt-2 max-w-2xl whitespace-pre-wrap text-stone-600">
                    {group.description}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
