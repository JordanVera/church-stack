'use client';

import { usePlanVisit } from '@/components/PlanVisitProvider';

type Props = {
  secondaryColor: string;
  className?: string;
  /** Nav styling when over the brand hero. */
  onBrand?: boolean;
  variant?: 'hero' | 'nav';
};

export function PlanVisitButton({
  secondaryColor,
  className = '',
  onBrand = false,
  variant = 'hero',
}: Props) {
  const { openPlanVisit, canPlanVisit } = usePlanVisit();

  if (!canPlanVisit) return null;

  if (variant === 'nav') {
    return (
      <button
        type="button"
        onClick={openPlanVisit}
        className={
          className ||
          `rounded-md px-3 py-1.5 text-xs font-semibold sm:text-sm ${
            onBrand ? 'text-stone-900' : 'text-white'
          }`
        }
        style={{ backgroundColor: secondaryColor }}
      >
        Plan a visit
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openPlanVisit}
      className={
        className ||
        'inline-flex rounded-md px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:opacity-95'
      }
      style={{ backgroundColor: secondaryColor }}
    >
      Plan a visit
    </button>
  );
}
