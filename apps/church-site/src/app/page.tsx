import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { LifeGroupsSection } from '@/components/LifeGroupsSection';
import { SermonsGrid } from '@/components/SermonsGrid';
import { SiteChrome } from '@/components/SiteChrome';
import { DAY_LABELS, formatServiceTime } from '@/lib/format';
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

  const {
    branding,
    contact,
    events,
    announcements,
    sermonSeries,
    sermons,
    sermonsNextPageToken,
    lifeGroups,
    locations,
  } = site;
  const primary = branding.primaryColor;
  const secondary = branding.secondaryColor;
  const givingUrl = branding.givingUrl?.trim() || null;
  const youtubeSermons = sermons ?? [];
  const groups = lifeGroups ?? [];
  const showYoutubeSermons = branding.features.sermons && youtubeSermons.length > 0;
  const showSeriesFallback =
    branding.features.sermons && !showYoutubeSermons && sermonSeries.length > 0;

  return (
    <main
      style={
        {
          '--church-primary': primary,
          '--church-secondary': secondary,
        } as CSSProperties
      }
    >
      <SiteChrome
        name={branding.name}
        logoUrl={branding.logoUrl}
        givingUrl={givingUrl}
        primaryColor={primary}
        secondaryColor={secondary}
        showVisit={locations.length > 0}
        showBelong={groups.length > 0}
        contact={contact}
      >
        <Hero
          name={branding.name}
          tagline={branding.tagline}
          logoUrl={branding.logoUrl}
          primaryColor={primary}
          secondaryColor={secondary}
          givingUrl={givingUrl}
          showVisit={locations.length > 0}
        />

        {locations.length > 0 ? (
          <section id="visit" className="mx-auto max-w-5xl px-6 py-20">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: primary }}
            >
              Visit
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Locations &amp; service times
            </h2>
            <p className="mt-3 max-w-xl text-stone-600">
              Find a campus near you and join us this week.
            </p>
            <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
              {locations.map((location) => (
                <li key={location.id} className="py-7">
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

        <LifeGroupsSection groups={groups} accentColor={primary} />

        {announcements.length > 0 ? (
          <section className="mx-auto max-w-5xl px-6 py-20">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: primary }}
            >
              News
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Announcements
            </h2>
            <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
              {announcements.map((a) => (
                <li key={a.id} className="py-7">
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <p className="mt-2 max-w-2xl whitespace-pre-wrap text-stone-600">{a.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {branding.features.events && events.length > 0 ? (
          <section className="border-y border-stone-200 bg-stone-50/80">
            <div className="mx-auto max-w-5xl px-6 py-20">
              <p
                className="text-xs font-semibold uppercase tracking-[0.22em]"
                style={{ color: primary }}
              >
                Gather
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                Upcoming events
              </h2>
              <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
                {events.map((event) => (
                  <li key={event.id} className="py-6">
                    <p className="text-sm font-medium" style={{ color: primary }}>
                      {new Date(event.startsAt).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{event.title}</h3>
                    {event.location ? (
                      <p className="mt-0.5 text-sm text-stone-500">{event.location}</p>
                    ) : null}
                    {event.description ? (
                      <p className="mt-2 max-w-2xl text-stone-600">{event.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {showYoutubeSermons ? (
          <SermonsGrid
            slug={slug}
            initialVideos={youtubeSermons}
            initialNextPageToken={sermonsNextPageToken ?? null}
            accentColor={primary}
          />
        ) : null}

        {showSeriesFallback ? (
          <section className="mx-auto max-w-5xl px-6 py-20">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: primary }}
            >
              Listen
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Sermon series
            </h2>
            <ul className="mt-10 divide-y divide-stone-200 border-t border-stone-200">
              {sermonSeries.map((series) => (
                <li key={series.id} className="py-6">
                  <h3 className="text-lg font-semibold">{series.title}</h3>
                  {series.description ? (
                    <p className="mt-2 max-w-2xl text-sm text-stone-600">{series.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {givingUrl ? (
          <section id="give" className="relative overflow-hidden text-white">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, color-mix(in srgb, ${primary} 75%, #0f172a) 100%)`,
              }}
            />
            <div className="relative mx-auto max-w-5xl px-6 py-20">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                Give
              </h2>
              <p className="mt-3 max-w-xl text-white/85">
                Support the mission with a secure gift through our online giving partner.
              </p>
              <a
                href={givingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-stone-900"
                style={{ backgroundColor: secondary }}
              >
                Give online
              </a>
            </div>
          </section>
        ) : null}
      </SiteChrome>
    </main>
  );
}
