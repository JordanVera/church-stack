import { DAY_LABELS, formatServiceTime } from '@/lib/format';
import { SectionShell } from '@/components/SectionShell';

type Location = {
  id: string;
  name: string;
  address: string | null;
  services: Array<{
    id: string;
    name: string;
    dayOfWeek: number;
    startTime: string;
  }>;
};

type Props = {
  locations: Location[];
  accentColor: string;
};

export function VisitSection({ locations, accentColor }: Props) {
  if (locations.length === 0) return null;

  return (
    <SectionShell id="visit" tone="default">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            Visit
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Locations &amp; service times
          </h2>
          <p className="mt-5 max-w-sm text-lg text-[var(--site-muted)]">
            Find a campus near you and join us this week.
          </p>
          <div
            className="mt-8 h-1 w-16 rounded-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden
          />
        </div>

        <ul className="space-y-10">
          {locations.map((location, index) => (
            <li
              key={location.id}
              className="border-t border-[var(--site-line)] pt-8 first:border-t-0 first:pt-0"
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums"
                  style={{ color: accentColor }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {location.name}
                </h3>
              </div>
              {location.address ? (
                <p className="mt-2 pl-10 text-[var(--site-muted)]">{location.address}</p>
              ) : null}
              {location.services.length > 0 ? (
                <ul className="mt-5 space-y-3 pl-10">
                  {location.services.map((service) => (
                    <li
                      key={service.id}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm sm:text-base"
                    >
                      <span className="font-semibold" style={{ color: accentColor }}>
                        {DAY_LABELS[service.dayOfWeek] ?? 'Weekly'}
                      </span>
                      <span className="text-[var(--site-muted)]">
                        {service.name} · {formatServiceTime(service.startTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
