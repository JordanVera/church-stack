import { z } from 'zod';
import { router, tenantProcedure } from '../trpc';

export const announcementsRouter = router({
  // Published announcements for the current tenant.
  list: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.announcement.findMany({
      where: { churchId: ctx.churchId, published: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  create: tenantProcedure
    .input(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.create({
        data: { ...input, churchId: ctx.churchId },
      });
    }),
});
