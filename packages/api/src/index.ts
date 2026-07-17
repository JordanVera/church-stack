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
  tenantProcedure,
  middleware,
  createCallerFactory,
} from './trpc';

/** Server-side caller (useful for RSC / scripts). */
export const createCaller = createCallerFactory(appRouter);
