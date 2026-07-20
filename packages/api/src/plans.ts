import type { PlanTierId } from '@repo/config';
import { planTierDefaults } from '@repo/config';

export type { PlanTierId };

/** Prisma-compatible defaults when assigning a product tier. */
export function churchDefaultsForPlanTier(tier: PlanTierId) {
  return planTierDefaults(tier);
}
