type Tone = 'default' | 'alt' | 'brand';

type Props = {
  id?: string;
  tone?: Tone;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionShell({
  id,
  tone = 'default',
  accentColor,
  children,
  className = '',
}: Props) {
  if (tone === 'brand') {
    return (
      <section
        id={id}
        className={`relative overflow-hidden text-white ${className}`}
        style={
          accentColor
            ? {
                background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 72%, #0f172a) 100%)`,
              }
            : undefined
        }
      >
        {children}
      </section>
    );
  }

  const bg =
    tone === 'alt' ? 'bg-[var(--site-band-alt)]' : 'bg-[var(--site-band)]';

  return (
    <section
      id={id}
      className={`border-b border-[var(--site-line)] ${bg} text-[var(--site-fg)] ${className}`}
    >
      {children}
    </section>
  );
}
