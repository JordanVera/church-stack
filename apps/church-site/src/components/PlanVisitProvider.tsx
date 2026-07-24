'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { PlanVisitModal, type VisitLocation } from '@/components/PlanVisitModal';

type PlanVisitContextValue = {
  openPlanVisit: () => void;
  canPlanVisit: boolean;
};

const PlanVisitContext = createContext<PlanVisitContextValue | null>(null);

export function usePlanVisit() {
  const ctx = useContext(PlanVisitContext);
  if (!ctx) {
    throw new Error('usePlanVisit must be used within PlanVisitProvider');
  }
  return ctx;
}

type Props = {
  slug: string;
  locations: VisitLocation[];
  accentColor: string;
  secondaryColor: string;
  children: React.ReactNode;
};

export function PlanVisitProvider({
  slug,
  locations,
  accentColor,
  secondaryColor,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const canPlanVisit = locations.length > 0;

  const openPlanVisit = useCallback(() => {
    if (canPlanVisit) setOpen(true);
  }, [canPlanVisit]);

  const value = useMemo(
    () => ({ openPlanVisit, canPlanVisit }),
    [openPlanVisit, canPlanVisit]
  );

  // Cast avoids duplicate @types/react (workspace vs app) JSX Provider mismatch.
  const Provider = PlanVisitContext.Provider as React.ComponentType<{
    value: PlanVisitContextValue;
    children?: React.ReactNode;
  }>;

  return (
    <Provider value={value}>
      {children}
      {canPlanVisit ? (
        <PlanVisitModal
          open={open}
          onOpenChange={setOpen}
          slug={slug}
          locations={locations}
          accentColor={accentColor}
          secondaryColor={secondaryColor}
        />
      ) : null}
    </Provider>
  );
}
