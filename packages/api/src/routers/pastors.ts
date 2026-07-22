import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, churchAdminProcedure } from '../trpc';
import { assertChurchAdmin } from '../church-admin';

export const pastorsRouter = router({
  list: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.pastor.findMany({
        where: { churchId: input.churchId },
        orderBy: [{ sortOrder: 'asc' }, { lastName: 'asc' }],
        include: {
          locations: { select: { id: true, name: true } },
        },
      });
    }),

  create: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        firstName: z.string().min(1).max(80),
        lastName: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const max = await ctx.prisma.pastor.aggregate({
        where: { churchId: input.churchId },
        _max: { sortOrder: true },
      });
      return ctx.prisma.pastor.create({
        data: {
          churchId: input.churchId,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          title: input.title.trim(),
          sortOrder: input.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
        },
      });
    }),

  update: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        firstName: z.string().min(1).max(80).optional(),
        lastName: z.string().min(1).max(80).optional(),
        title: z.string().min(1).max(120).optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const existing = await ctx.prisma.pastor.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pastor not found' });
      }
      return ctx.prisma.pastor.update({
        where: { id: existing.id },
        data: {
          firstName: input.firstName?.trim(),
          lastName: input.lastName?.trim(),
          title: input.title?.trim(),
          sortOrder: input.sortOrder,
        },
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const existing = await ctx.prisma.pastor.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pastor not found' });
      }
      await ctx.prisma.pastor.delete({ where: { id: existing.id } });
      return { ok: true };
    }),
});
