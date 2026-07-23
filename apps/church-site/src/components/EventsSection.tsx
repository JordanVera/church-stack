import { SectionShell } from '@/components/SectionShell';

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
};

type Props = {
  events: EventItem[];
  accentColor: string;
};

export function EventsSection({ events, accentColor }: Props) {
  if (events.length === 0) return null;

  return (
    <SectionShell tone="alt">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          Gather
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Upcoming events
        </h2>

        <ul className="mt-14 space-y-0">
          {events.map((event) => {
            const date = new Date(event.startsAt);
            const month = date.toLocaleString(undefined, { month: 'short' });
            const day = date.toLocaleString(undefined, { day: 'numeric' });
            const weekday = date.toLocaleString(undefined, { weekday: 'short' });
            const time = date.toLocaleString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <li
                key={event.id}
                className="grid gap-4 border-t border-[var(--site-line)] py-8 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-8"
              >
                <div className="sm:pt-1">
                  <p
                    className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none tracking-tight"
                    style={{ color: accentColor }}
                  >
                    {day}
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--site-muted)]">
                    {month} · {weekday}
                  </p>
                  <p className="mt-1 text-sm text-[var(--site-muted)]">{time}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{event.title}</h3>
                  {event.location ? (
                    <p className="mt-2 text-sm font-medium" style={{ color: accentColor }}>
                      {event.location}
                    </p>
                  ) : null}
                  {event.description ? (
                    <p className="mt-3 max-w-2xl leading-relaxed text-[var(--site-muted)]">
                      {event.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
