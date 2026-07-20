import { loadPublicSite, resolveChurchSlug } from '../lib/site';

export default async function HomePage() {
  const slug = resolveChurchSlug();
  if (!slug) {
    return (
      <main style={{ padding: '4rem 1.5rem', maxWidth: 40 * 16, margin: '0 auto' }}>
        <h1>Missing CHURCH_SLUG</h1>
        <p>Set CHURCH_SLUG and PLATFORM_API_URL for this Custom plan deploy.</p>
      </main>
    );
  }

  const site = await loadPublicSite(slug);
  if (!site) {
    return (
      <main style={{ padding: '4rem 1.5rem', maxWidth: 40 * 16, margin: '0 auto' }}>
        <h1>Church not found</h1>
        <p>No active church for slug “{slug}”.</p>
      </main>
    );
  }

  const { branding, events, lifeGroups } = site;

  return (
    <main>
      <header
        style={{
          padding: '5rem 1.5rem 3rem',
          background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
          color: '#fff',
        }}
      >
        <p style={{ opacity: 0.85, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Custom site · {branding.slug}
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', margin: '0.5rem 0' }}>
          {branding.name}
        </h1>
        {branding.tagline ? <p style={{ fontSize: '1.25rem' }}>{branding.tagline}</p> : null}
      </header>

      <section style={{ padding: '3rem 1.5rem', maxWidth: 48 * 16, margin: '0 auto' }}>
        <h2>Upcoming events</h2>
        <p style={{ color: '#555' }}>
          Same events as the mobile app — shared database via Church Stack API.
        </p>
        <ul style={{ paddingLeft: '1.25rem' }}>
          {events.length === 0 ? <li>No upcoming events.</li> : null}
          {events.map((event) => (
            <li key={event.id} style={{ marginBottom: '0.75rem' }}>
              <strong>{event.title}</strong>
              <br />
              <span style={{ color: '#666' }}>
                {new Date(event.startsAt).toLocaleString()}
                {event.location ? ` · ${event.location}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ padding: '0 1.5rem 4rem', maxWidth: 48 * 16, margin: '0 auto' }}>
        <h2>Life groups</h2>
        <ul style={{ paddingLeft: '1.25rem' }}>
          {lifeGroups.length === 0 ? <li>No life groups yet.</li> : null}
          {lifeGroups.map((group) => (
            <li key={group.id} style={{ marginBottom: '0.75rem' }}>
              <strong>{group.name}</strong>
              {group.description ? (
                <>
                  <br />
                  <span style={{ color: '#666' }}>{group.description}</span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
