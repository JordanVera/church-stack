import { router } from '../trpc';
import { churchRouter } from './church';
import { authRouter } from './auth';
import { announcementsRouter } from './announcements';
import { eventsRouter } from './events';
import { billingRouter } from './billing';

export const appRouter = router({
  church: churchRouter,
  auth: authRouter,
  announcements: announcementsRouter,
  events: eventsRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
