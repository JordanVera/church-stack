import { SectionShell } from '@/components/SectionShell';

type Props = {
  givingUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

export function GiveSection({ givingUrl, primaryColor, secondaryColor }: Props) {
  return (
    <SectionShell id="give" tone="brand" accentColor={primaryColor}>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-28 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Give</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Support the mission
          </h2>
          <p className="mt-5 text-lg text-white/80">
            Give securely through our online giving partner and help our church love our city.
          </p>
        </div>
        <a
          href={givingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit rounded-md px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:opacity-95"
          style={{ backgroundColor: secondaryColor }}
        >
          Give online
        </a>
      </div>
    </SectionShell>
  );
}
