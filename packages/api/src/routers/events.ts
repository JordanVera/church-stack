import { z } from 'zod';
import { router, tenantProcedure } from '../trpc';

export const eventsRouter = router({
  // Upcoming events for the current tenant.
  upcoming: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { churchId: ctx.churchId, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    });
  }),

  list: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { startsAt: 'desc' },
    });
  }),

  create: tenantProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        location: z.string().optional(),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.create({
        data: { ...input, churchId: ctx.churchId },
      });
    }),
});
