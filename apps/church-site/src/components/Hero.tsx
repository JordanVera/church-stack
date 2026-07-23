type HeroProps = {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  givingUrl: string | null;
  showVisit: boolean;
};

export function Hero({
  name,
  tagline,
  logoUrl,
  primaryColor,
  secondaryColor,
  givingUrl,
  showVisit,
}: HeroProps) {
  const headline = tagline?.trim() || 'Welcome';

  return (
    <section
      id="top"
      className="relative isolate min-h-[88vh] overflow-hidden px-6 pb-24 pt-20 text-white sm:pt-28"
      style={{
        background: `linear-gradient(155deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 68%, #0f172a) 52%, ${secondaryColor} 130%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.38), transparent 42%), radial-gradient(circle at 82% 8%, rgba(255,255,255,0.22), transparent 34%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.18), transparent 40%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-12deg, rgba(255,255,255,0.55) 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col justify-end">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="site-anim-logo h-20 w-auto max-w-[220px] object-contain drop-shadow-sm sm:h-24"
          />
        ) : null}

        <p
          className={`site-anim-rise site-anim-delay-1 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl ${
            logoUrl ? 'mt-6' : ''
          }`}
        >
          {name}
        </p>

        <h1 className="site-anim-rise site-anim-delay-2 mt-5 max-w-2xl text-2xl font-medium leading-snug text-white/95 sm:text-3xl">
          {headline}
        </h1>

        <p className="site-anim-rise site-anim-delay-3 mt-4 max-w-lg text-lg text-white/80">
          Join us for worship, community, and life together.
        </p>

        <div className="site-anim-rise site-anim-delay-4 mt-10 flex flex-wrap gap-3">
          {showVisit ? (
            <a
              href="#visit"
              className="inline-flex rounded-md px-5 py-3 text-sm font-semibold text-stone-900 transition hover:opacity-95"
              style={{ backgroundColor: secondaryColor }}
            >
              Plan a visit
            </a>
          ) : null}
          {givingUrl ? (
            <a
              href={givingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-md border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Give
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
