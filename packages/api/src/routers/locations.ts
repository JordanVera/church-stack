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
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24h)');

export const locationsRouter = router({
  list: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.location.findMany({
        where: { churchId: input.churchId },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          pastor: { select: { id: true, firstName: true, lastName: true, title: true } },
          services: { orderBy: [{ sortOrder: 'asc' }, { dayOfWeek: 'asc' }] },
        },
      });
    }),

  create: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        name: z.string().min(1).max(120),
        address: z.string().min(1).max(300),
        pastorId: z.string().min(1).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      if (input.pastorId) {
        const pastor = await ctx.prisma.pastor.findFirst({
          where: { id: input.pastorId, churchId: input.churchId },
        });
        if (!pastor) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pastor not found for this church' });
        }
      }

      const max = await ctx.prisma.location.aggregate({
        where: { churchId: input.churchId },
        _max: { sortOrder: true },
      });

      return ctx.prisma.location.create({
        data: {
          churchId: input.churchId,
          name: input.name.trim(),
          address: input.address.trim(),
          pastorId: input.pastorId ?? null,
          sortOrder: (max._max.sortOrder ?? 0) + 1,
          source: 'MANUAL',
        },
        include: {
          pastor: { select: { id: true, firstName: true, lastName: true, title: true } },
          services: true,
        },
      });
    }),

  update: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        name: z.string().min(1).max(120).optional(),
        address: z.string().min(1).max(300).optional(),
        pastorId: z.string().min(1).optional().nullable(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.location.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      assertEditableContentRow(church, existing.source);

      if (input.pastorId) {
        const pastor = await ctx.prisma.pastor.findFirst({
          where: { id: input.pastorId, churchId: input.churchId },
        });
        if (!pastor) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pastor not found for this church' });
        }
      }

      return ctx.prisma.location.update({
        where: { id: existing.id },
        data: {
          name: input.name?.trim(),
          address: input.address?.trim(),
          pastorId: input.pastorId === undefined ? undefined : input.pastorId,
          sortOrder: input.sortOrder,
          source: 'MANUAL',
          externalId: null,
        },
        include: {
          pastor: { select: { id: true, firstName: true, lastName: true, title: true } },
          services: { orderBy: [{ sortOrder: 'asc' }, { dayOfWeek: 'asc' }] },
        },
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.location.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      assertEditableContentRow(church, existing.source);

      await ctx.prisma.location.delete({ where: { id: existing.id } });
      return { ok: true };
    }),

  createService: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        locationId: z.string().min(1),
        name: z.string().min(1).max(120),
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: timeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const location = await ctx.prisma.location.findFirst({
        where: { id: input.locationId, churchId: input.churchId },
      });
      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      assertEditableContentRow(church, location.source);

      const max = await ctx.prisma.service.aggregate({
        where: { locationId: location.id },
        _max: { sortOrder: true },
      });

      return ctx.prisma.service.create({
        data: {
          locationId: location.id,
          name: input.name.trim(),
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          sortOrder: (max._max.sortOrder ?? 0) + 1,
          source: 'MANUAL',
        },
      });
    }),

  updateService: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        locationId: z.string().min(1),
        id: z.string().min(1),
        name: z.string().min(1).max(120).optional(),
        dayOfWeek: z.number().int().min(0).max(6).optional(),
        startTime: timeSchema.optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const location = await ctx.prisma.location.findFirst({
        where: { id: input.locationId, churchId: input.churchId },
      });
      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      assertEditableContentRow(church, location.source);

      const existing = await ctx.prisma.service.findFirst({
        where: { id: input.id, locationId: location.id },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }
      assertEditableContentRow(church, existing.source);

      return ctx.prisma.service.update({
        where: { id: existing.id },
        data: {
          name: input.name?.trim(),
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          sortOrder: input.sortOrder,
          source: 'MANUAL',
          externalId: null,
        },
      });
    }),

  deleteService: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        locationId: z.string().min(1),
        id: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const location = await ctx.prisma.location.findFirst({
        where: { id: input.locationId, churchId: input.churchId },
      });
      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }
      assertEditableContentRow(church, location.source);

      const existing = await ctx.prisma.service.findFirst({
        where: { id: input.id, locationId: location.id },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }
      assertEditableContentRow(church, existing.source);

      await ctx.prisma.service.delete({ where: { id: existing.id } });
      return { ok: true };
    }),
});
