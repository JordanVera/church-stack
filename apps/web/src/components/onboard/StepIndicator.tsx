import { Check } from 'lucide-react';
import { STEPS } from './types';

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Signup progress" className="w-full">
      <ol className="flex items-start justify-between gap-1">
        {STEPS.map((step, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <li key={step.id} className="relative flex flex-1 flex-col items-center text-center">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute top-4 left-[calc(50%+1.1rem)] h-px w-[calc(100%-2.2rem)] ${
                    done ? 'bg-brand-500' : 'bg-ink-200 dark:bg-ink-700'
                  }`}
                />
              ) : null}
              <span
                className={`relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-4 ring-brand-100 dark:ring-brand-900/50'
                    : done
                      ? 'bg-brand-600 text-white'
                      : 'border border-ink-200 bg-white text-ink-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-500'
                }`}
              >
                {done ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              <span
                className={`mt-2 text-[11px] font-semibold tracking-wide uppercase sm:text-xs ${
                  active
                    ? 'text-brand-700 dark:text-brand-300'
                    : done
                      ? 'text-ink-700 dark:text-ink-200'
                      : 'text-ink-400 dark:text-ink-500'
                }`}
              >
                {step.label}
              </span>
              <span className="mt-0.5 hidden text-[11px] text-ink-400 sm:block dark:text-ink-500">
                {step.blurb}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
