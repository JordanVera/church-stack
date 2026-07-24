import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { AnnouncementsSection } from '@/components/AnnouncementsSection';
import { EventsSection } from '@/components/EventsSection';
import { GiveSection } from '@/components/GiveSection';
import { Hero } from '@/components/Hero';
import { LifeGroupsSection } from '@/components/LifeGroupsSection';
import { PlanVisitProvider } from '@/components/PlanVisitProvider';
import { SectionShell } from '@/components/SectionShell';
import { SermonsGrid } from '@/components/SermonsGrid';
import { SiteChrome } from '@/components/SiteChrome';
import ThemeProvider from '@/components/ThemeProvider';
import { VisitSection } from '@/components/VisitSection';
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
        <p className="mt-3 text-[var(--site-muted)]">
          Set <code className="rounded bg-[var(--site-band-alt)] px-1">CHURCH_SLUG</code> for this
          deploy, or open with{' '}
          <code className="rounded bg-[var(--site-band-alt)] px-1">?slug=grace</code> for local
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
        <p className="mt-3 text-[var(--site-muted)]">
          No active church with slug <strong>{slug}</strong>. Is the platform API running at{' '}
          <code className="rounded bg-[var(--site-band-alt)] px-1">PLATFORM_API_URL</code>?
        </p>
      </main>
    );
  }

  const {
    branding,
    contact,
    social,
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

  const themeDefault = branding.themeDefault ?? 'light';

  return (
    <ThemeProvider defaultTheme={themeDefault}>
      <main
        style={
          {
            '--church-primary': primary,
            '--church-secondary': secondary,
          } as CSSProperties
        }
      >
        <PlanVisitProvider
          slug={slug}
          locations={locations}
          accentColor={primary}
          secondaryColor={secondary}
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
          social={social}
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

          <VisitSection locations={locations} accentColor={primary} />
          <LifeGroupsSection groups={groups} accentColor={primary} />
          <AnnouncementsSection announcements={announcements} accentColor={primary} />

          {branding.features.events ? (
            <EventsSection events={events} accentColor={primary} />
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
            <SectionShell tone="default">
              <div className="mx-auto max-w-6xl px-6 py-24">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: primary }}
                >
                  Listen
                </p>
                <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                  Sermon series
                </h2>
                <ul className="mt-14 space-y-8">
                  {sermonSeries.map((series) => (
                    <li
                      key={series.id}
                      className="border-t border-[var(--site-line)] pt-8 first:border-t-0 first:pt-0"
                    >
                      <h3 className="text-2xl font-semibold tracking-tight">{series.title}</h3>
                      {series.description ? (
                        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--site-muted)]">
                          {series.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionShell>
          ) : null}

          {givingUrl ? (
            <GiveSection givingUrl={givingUrl} primaryColor={primary} secondaryColor={secondary} />
          ) : null}
        </SiteChrome>
      </PlanVisitProvider>
      </main>
    </ThemeProvider>
  );
}
