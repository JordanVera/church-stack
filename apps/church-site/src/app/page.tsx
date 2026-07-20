import type { Metadata } from 'next';
import { fetchPublicSite, resolveChurchSlug } from '@/lib/site';

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

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

  const { branding, contact, events, announcements, sermonSeries } = site;
  const primary = branding.primaryColor;
  const secondary = branding.secondaryColor;

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
          {branding.features.giving ? (
            <a
              href="#give"
              className="mt-8 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-stone-900"
              style={{ backgroundColor: secondary }}
            >
              Give
            </a>
          ) : null}
        </div>
      </section>

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

      {branding.features.sermons && sermonSeries.length > 0 ? (
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

      {branding.features.giving ? (
        <section id="give" className="border-t border-stone-200 bg-stone-100">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Give
            </h2>
            <p className="mt-3 max-w-xl text-stone-600">
              Online giving will connect here. For now, contact the church office to support the
              mission.
            </p>
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
