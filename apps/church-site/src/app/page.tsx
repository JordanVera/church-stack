import type { Metadata } from 'next';
import { fetchPublicSite, resolveChurchSlug } from '@/lib/site';

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function formatServiceTime(startTime: string) {
  const [hRaw, mRaw] = startTime.split(':');
  const hours = Number(hRaw);
  const minutes = Number(mRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return startTime;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const slug = resolveChurchSlug(params.slug);
  if (!slug) return { title: 'Church site' };
  const site = await fetchPublicSite(slug);
  if (!site) return { title: 'Church not found' };
  return {
    title: site.branding.name,
    description: site.branding.tagline ?? undefined,
  };
}

export default async function ChurchHomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const slug = resolveChurchSlug(params.slug);

  if (!slug) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Missing church
        </h1>
        <p className="mt-3 text-stone-600">
          Set <code className="rounded bg-stone-200 px-1">CHURCH_SLUG</code> for this deploy, or
          open with <code className="rounded bg-stone-200 px-1">?slug=grace</code> for local
          preview.
        </p>
      </main>
    );
  }

  const site = await fetchPublicSite(slug);

  if (!site) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Church not found
        </h1>
        <p className="mt-3 text-stone-600">
          No active church with slug <strong>{slug}</strong>. Is the platform API running at{' '}
          <code className="rounded bg-stone-200 px-1">PLATFORM_API_URL</code>?
        </p>
      </main>
    );
  }

  const { branding, contact, events, announcements, sermonSeries, sermons, locations } = site;
  const primary = branding.primaryColor;
  const secondary = branding.secondaryColor;
  const givingUrl = branding.givingUrl?.trim() || null;
  const youtubeSermons = sermons ?? [];
  const showYoutubeSermons = branding.features.sermons && youtubeSermons.length > 0;
  const showSeriesFallback =
    branding.features.sermons && !showYoutubeSermons && sermonSeries.length > 0;

  return (
    <main>
      <section
        className="relative isolate min-h-[72vh] overflow-hidden px-6 pb-20 pt-16 text-white"
        style={{
          background: `linear-gradient(145deg, ${primary} 0%, color-mix(in srgb, ${primary} 70%, #0f172a) 55%, ${secondary} 120%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.2), transparent 35%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
            {branding.name}
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {branding.tagline ?? 'Welcome'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Join us for worship, community, and life together.
          </p>
          {givingUrl ? (
            <a
              href={givingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-stone-900"
              style={{ backgroundColor: secondary }}
            >
              Give
            </a>
          ) : null}
        </div>
      </section>

      {locations.length > 0 ? (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Locations &amp; service times
          </h2>
          <ul className="mt-8 space-y-8">
            {locations.map((location) => (
              <li key={location.id} className="border-t border-stone-200 pt-6">
                <h3 className="text-xl font-semibold">{location.name}</h3>
                {location.address ? (
                  <p className="mt-1 text-stone-600">{location.address}</p>
                ) : null}
                {location.services.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {location.services.map((service) => (
                      <li key={service.id} className="text-sm text-stone-700">
                        <span className="font-medium" style={{ color: primary }}>
                          {DAY_LABELS[service.dayOfWeek] ?? 'Weekly'}
                        </span>
                        {' · '}
                        {service.name} at {formatServiceTime(service.startTime)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {announcements.length > 0 ? (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Announcements
          </h2>
          <ul className="mt-8 space-y-6">
            {announcements.map((a) => (
              <li key={a.id} className="border-t border-stone-200 pt-6">
                <h3 className="text-xl font-semibold">{a.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-stone-600">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {branding.features.events && events.length > 0 ? (
        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Upcoming events
            </h2>
            <ul className="mt-8 space-y-5">
              {events.map((event) => (
                <li key={event.id}>
                  <p className="text-sm font-medium" style={{ color: primary }}>
                    {new Date(event.startsAt).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  {event.location ? (
                    <p className="text-sm text-stone-500">{event.location}</p>
                  ) : null}
                  {event.description ? (
                    <p className="mt-1 text-stone-600">{event.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {showYoutubeSermons ? (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Sermons
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {youtubeSermons.map((video) => (
              <li
                key={video.videoId}
                className="overflow-hidden rounded-lg border border-stone-200"
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-video bg-stone-100">
                    {video.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition group-hover:opacity-95"
                      />
                    ) : null}
                    {video.duration ? (
                      <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold group-hover:underline">
                      {video.title}
                    </h3>
                    {video.publishedAt ? (
                      <p className="mt-1 text-xs text-stone-500">
                        {new Date(video.publishedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    ) : null}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showSeriesFallback ? (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Sermon series
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {sermonSeries.map((series) => (
              <li key={series.id} className="rounded-lg border border-stone-200 p-5">
                <h3 className="text-lg font-semibold">{series.title}</h3>
                {series.description ? (
                  <p className="mt-2 text-sm text-stone-600">{series.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {givingUrl ? (
        <section id="give" className="border-t border-stone-200 bg-stone-100">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Give
            </h2>
            <p className="mt-3 max-w-xl text-stone-600">
              Support the mission with a secure gift through our online giving partner.
            </p>
            <a
              href={givingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              Give online
            </a>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-stone-200 px-6 py-10 text-sm text-stone-500">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{branding.name}</p>
          <p>
            {[contact.address, contact.phone, contact.email].filter(Boolean).join(' · ') ||
              'Powered by Church Stack'}
          </p>
        </div>
      </footer>
    </main>
  );
}
