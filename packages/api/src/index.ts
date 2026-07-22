import { appRouter } from './routers';
import { createCallerFactory } from './trpc';

export { appRouter } from './routers';
export type { AppRouter } from './routers';
export { createContext } from './context';
export type { Context, Session, SessionUser, CreateContextOptions } from './context';
export {
  router,
  publicProcedure,
  protectedProcedure,
  churchAdminProcedure,
  devProcedure,
  tenantProcedure,
  middleware,
  createCallerFactory,
} from './trpc';
export { isPlatformDev } from './platform-dev';
export {
  assertChurchAdmin,
  assertChurchAdminBySlug,
  assertManualCmsMode,
  assertEditableContentRow,
  isPlanningCenterLinked,
} from './church-admin';
export { applyStripeSubscriptionToChurch } from './routers/billing';
export { getStripe, isStripeConfigured, planTierForPriceId } from './billing/stripe';
export { churchDefaultsForPlanTier } from './plans';
export { provisionChurchWebsite } from './provision/vercel';

/** Server-side caller (useful for RSC / scripts). */
export const createCaller = createCallerFactory(appRouter);
