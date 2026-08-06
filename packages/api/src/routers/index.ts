import { router } from '../trpc';
import { churchRouter } from './church';
import { authRouter } from './auth';
import { announcementsRouter } from './announcements';
import { eventsRouter } from './events';
import { billingRouter } from './billing';
import { pastorsRouter } from './pastors';
import { locationsRouter } from './locations';
import { lifeGroupsRouter } from './lifeGroups';
import { visitPlansRouter } from './visitPlans';
import { engagementRouter } from './engagement';
import { supportRouter } from './support';

export const appRouter = router({
  church: churchRouter,
  auth: authRouter,
  announcements: announcementsRouter,
  events: eventsRouter,
  billing: billingRouter,
  pastors: pastorsRouter,
  locations: locationsRouter,
  lifeGroups: lifeGroupsRouter,
  visitPlans: visitPlansRouter,
  engagement: engagementRouter,
  support: supportRouter,
});

export type AppRouter = typeof appRouter;
