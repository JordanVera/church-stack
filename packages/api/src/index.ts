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
  devProcedure,
  tenantProcedure,
  middleware,
  createCallerFactory,
} from './trpc';
export { isPlatformDev } from './platform-dev';
export { applyStripeSubscriptionToChurch } from './routers/billing';
export { getStripe, isStripeConfigured, planTierForPriceId } from './billing/stripe';
export { churchDefaultsForPlanTier } from './plans';

/** Server-side caller (useful for RSC / scripts). */
export const createCaller = createCallerFactory(appRouter);
