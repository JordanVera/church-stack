import { STEPS } from './types';

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="text-ink-300 dark:text-ink-600" aria-hidden>
                /
              </span>
            ) : null}
            <span
              className={
                active
                  ? 'font-semibold text-brand-600 dark:text-brand-400'
                  : done
                    ? 'font-medium text-ink-700 dark:text-ink-200'
                    : 'text-ink-400 dark:text-ink-500'
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
