import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FieldSection({ title, description, children }: Props) {
  return (
    <section className="space-y-4">
      <div className="border-b border-ink-200/80 pb-3 dark:border-ink-800">
        <h3 className="font-display text-base font-semibold tracking-tight text-ink-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
