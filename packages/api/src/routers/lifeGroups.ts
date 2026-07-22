import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, churchAdminProcedure } from '../trpc';
import {
  assertChurchAdmin,
  assertManualCmsMode,
  assertEditableContentRow,
} from '../church-admin';

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24h)')
  .optional()
  .nullable();

export const lifeGroupsRouter = router({
  list: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.lifeGroup.findMany({
        where: { churchId: input.churchId },
        orderBy: { name: 'asc' },
      });
    }),

  create: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        name: z.string().min(1).max(120),
        description: z.string().max(5000).optional().nullable(),
        location: z.string().max(300).optional().nullable(),
        meetingDay: z.number().int().min(0).max(6).optional().nullable(),
        meetingTime: timeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      return ctx.prisma.lifeGroup.create({
        data: {
          churchId: input.churchId,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          location: input.location?.trim() || null,
          meetingDay: input.meetingDay ?? null,
          meetingTime: input.meetingTime ?? null,
          source: 'MANUAL',
        },
      });
    }),

  update: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        name: z.string().min(1).max(120).optional(),
        description: z.string().max(5000).optional().nullable(),
        location: z.string().max(300).optional().nullable(),
        meetingDay: z.number().int().min(0).max(6).optional().nullable(),
        meetingTime: timeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.lifeGroup.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Life group not found' });
      }
      assertEditableContentRow(church, existing.source);

      return ctx.prisma.lifeGroup.update({
        where: { id: existing.id },
        data: {
          name: input.name?.trim(),
          description:
            input.description === undefined ? undefined : input.description?.trim() || null,
          location: input.location === undefined ? undefined : input.location?.trim() || null,
          meetingDay: input.meetingDay === undefined ? undefined : input.meetingDay,
          meetingTime: input.meetingTime === undefined ? undefined : input.meetingTime,
          source: 'MANUAL',
          externalId: null,
        },
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.lifeGroup.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Life group not found' });
      }
      assertEditableContentRow(church, existing.source);

      await ctx.prisma.lifeGroup.delete({ where: { id: existing.id } });
      return { ok: true };
    }),
});
