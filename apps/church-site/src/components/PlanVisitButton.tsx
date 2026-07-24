'use client';

import { useState } from 'react';
import { PlanVisitModal, type VisitLocation } from '@/components/PlanVisitModal';

type Props = {
  slug: string;
  locations: VisitLocation[];
  secondaryColor: string;
  accentColor: string;
  className?: string;
};

export function PlanVisitButton({
  slug,
  locations,
  secondaryColor,
  accentColor,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);

  if (locations.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'inline-flex rounded-md px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:opacity-95'
        }
        style={{ backgroundColor: secondaryColor }}
      >
        Plan a visit
      </button>
      <PlanVisitModal
        open={open}
        onClose={() => setOpen(false)}
        slug={slug}
        locations={locations}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />
    </>
  );
}
