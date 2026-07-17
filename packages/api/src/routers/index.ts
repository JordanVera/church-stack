import { router } from '../trpc';
import { churchRouter } from './church';
import { authRouter } from './auth';
import { announcementsRouter } from './announcements';
import { eventsRouter } from './events';

export const appRouter = router({
  church: churchRouter,
  auth: authRouter,
  announcements: announcementsRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
