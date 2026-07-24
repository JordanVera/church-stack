import { PlanVisitButton } from '@/components/PlanVisitButton';

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
      className="relative isolate flex min-h-[100svh] overflow-hidden px-6 pb-24 pt-28 text-white sm:pt-32"
      style={{
        background: `linear-gradient(155deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 62%, #0b1220) 48%, ${secondaryColor} 140%)`,
      }}
    >
      <div
        className="site-anim-drift pointer-events-none absolute -inset-[12%] opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.42), transparent 42%), radial-gradient(circle at 82% 8%, rgba(255,255,255,0.24), transparent 34%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.22), transparent 42%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-14deg, rgba(255,255,255,0.55) 0 1px, transparent 1px 16px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end pb-4 sm:pb-10 lg:pl-8">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="site-anim-logo h-24 w-auto max-w-[260px] object-contain drop-shadow-sm sm:h-28"
          />
        ) : null}

        <p
          className={`site-anim-rise site-anim-delay-1 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl ${
            logoUrl ? 'mt-8' : ''
          }`}
        >
          {name}
        </p>

        <h1 className="site-anim-rise site-anim-delay-2 mt-6 max-w-xl text-2xl font-medium leading-snug text-white/92 sm:text-3xl md:text-4xl">
          {headline}
        </h1>

        <p className="site-anim-rise site-anim-delay-3 mt-5 max-w-md text-lg text-white/75">
          Join us for worship, community, and life together.
        </p>

        <div className="site-anim-rise site-anim-delay-4 mt-12 flex flex-wrap gap-3">
          {showVisit ? <PlanVisitButton secondaryColor={secondaryColor} /> : null}
          {givingUrl ? (
            <a
              href={givingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-md border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Give
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
