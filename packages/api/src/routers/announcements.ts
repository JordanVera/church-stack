import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, tenantProcedure, churchAdminProcedure } from '../trpc';
import { assertChurchAdmin } from '../church-admin';

export const announcementsRouter = router({
  // Public / app: published announcements for the current tenant.
  list: tenantProcedure.query(async ({ ctx }) => {
    return ctx.prisma.announcement.findMany({
      where: { churchId: ctx.churchId, published: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** Owner CMS: all announcements including drafts. */
  adminList: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.announcement.findMany({
        where: { churchId: input.churchId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(20000),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.announcement.create({
        data: {
          churchId: input.churchId,
          title: input.title.trim(),
          body: input.body.trim(),
          published: input.published,
        },
      });
    }),

  update: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).max(20000).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const existing = await ctx.prisma.announcement.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Announcement not found' });
      }
      return ctx.prisma.announcement.update({
        where: { id: existing.id },
        data: {
          title: input.title?.trim(),
          body: input.body?.trim(),
          published: input.published,
        },
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const existing = await ctx.prisma.announcement.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Announcement not found' });
      }
      await ctx.prisma.announcement.delete({ where: { id: existing.id } });
      return { ok: true };
    }),
});
