import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, tenantProcedure, churchAdminProcedure, protectedProcedure } from '../trpc';
import type { Context } from '../context';
import {
  assertChurchAdmin,
  assertManualCmsMode,
  assertEditableContentRow,
} from '../church-admin';

async function resolveTenantChurchId(ctx: Context): Promise<string> {
  let churchId = ctx.churchId;

  if (!churchId && ctx.churchSlug) {
    const church = await ctx.prisma.church.findUnique({
      where: { slug: ctx.churchSlug },
      select: { id: true },
    });
    churchId = church?.id ?? null;
  }

  if (!churchId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing tenant. Provide an x-church-id or x-church-slug header.',
    });
  }

  return churchId;
}

async function withRegistrationStatus<T extends { id: string }>(
  ctx: Context,
  events: T[]
): Promise<Array<T & { isRegistered: boolean }>> {
  const userId = ctx.session?.user?.id;
  if (!userId || events.length === 0) {
    return events.map((event) => ({ ...event, isRegistered: false }));
  }

  const registrations = await ctx.prisma.eventRegistration.findMany({
    where: {
      userId,
      eventId: { in: events.map((event) => event.id) },
    },
    select: { eventId: true },
  });
  const registered = new Set(registrations.map((row) => row.eventId));

  return events.map((event) => ({
    ...event,
    isRegistered: registered.has(event.id),
  }));
}

export const eventsRouter = router({
  // Public / app: upcoming events for the current tenant.
  upcoming: tenantProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      where: { churchId: ctx.churchId, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    });
    return withRegistrationStatus(ctx, events);
  }),

  list: tenantProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      where: { churchId: ctx.churchId },
      orderBy: { startsAt: 'desc' },
    });
    return withRegistrationStatus(ctx, events);
  }),

  /** Owner CMS list (includes all sources; edits gated on MANUAL + !PCO linked). */
  adminList: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.event.findMany({
        where: { churchId: input.churchId },
        orderBy: { startsAt: 'desc' },
      });
    }),

  create: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        title: z.string().min(1).max(200),
        description: z.string().max(10000).optional().nullable(),
        location: z.string().max(300).optional().nullable(),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date().optional().nullable(),
        requiresRegistration: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      return ctx.prisma.event.create({
        data: {
          churchId: input.churchId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          location: input.location?.trim() || null,
          startsAt: input.startsAt,
          endsAt: input.endsAt ?? null,
          requiresRegistration: input.requiresRegistration ?? false,
          source: 'MANUAL',
        },
      });
    }),

  update: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(10000).optional().nullable(),
        location: z.string().max(300).optional().nullable(),
        startsAt: z.coerce.date().optional(),
        endsAt: z.coerce.date().optional().nullable(),
        requiresRegistration: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.event.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      assertEditableContentRow(church, existing.source);

      return ctx.prisma.event.update({
        where: { id: existing.id },
        data: {
          title: input.title?.trim(),
          description:
            input.description === undefined ? undefined : input.description?.trim() || null,
          location: input.location === undefined ? undefined : input.location?.trim() || null,
          startsAt: input.startsAt,
          endsAt: input.endsAt === undefined ? undefined : input.endsAt,
          requiresRegistration: input.requiresRegistration,
          source: 'MANUAL',
          externalId: null,
        },
      });
    }),

  /**
   * Toggle registration requirement without rewriting event content.
   * Safe for MANUAL and Planning Center–synced rows.
   */
  setRequiresRegistration: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        id: z.string().min(1),
        requiresRegistration: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);

      const existing = await ctx.prisma.event.findFirst({
        where: { id: input.id, churchId: input.churchId },
        select: { id: true },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }

      return ctx.prisma.event.update({
        where: { id: existing.id },
        data: { requiresRegistration: input.requiresRegistration },
        select: {
          id: true,
          requiresRegistration: true,
        },
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const church = await assertChurchAdmin(ctx, input.churchId);
      assertManualCmsMode(church);

      const existing = await ctx.prisma.event.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      assertEditableContentRow(church, existing.source);

      await ctx.prisma.event.delete({ where: { id: existing.id } });
      return { ok: true };
    }),

  register: protectedProcedure
    .input(z.object({ eventId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const churchId = await resolveTenantChurchId(ctx);
      const userId = ctx.session!.user!.id;

      const event = await ctx.prisma.event.findFirst({
        where: { id: input.eventId, churchId },
        select: {
          id: true,
          startsAt: true,
          requiresRegistration: true,
        },
      });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }
      if (!event.requiresRegistration) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This event does not require registration.',
        });
      }
      if (event.startsAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This event has already started.',
        });
      }

      try {
        await ctx.prisma.eventRegistration.create({
          data: { eventId: event.id, userId },
        });
      } catch {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already registered for this event.',
        });
      }

      return { ok: true as const, isRegistered: true as const };
    }),

  cancelRegistration: protectedProcedure
    .input(z.object({ eventId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const churchId = await resolveTenantChurchId(ctx);
      const userId = ctx.session!.user!.id;

      const event = await ctx.prisma.event.findFirst({
        where: { id: input.eventId, churchId },
        select: { id: true },
      });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }

      await ctx.prisma.eventRegistration.deleteMany({
        where: { eventId: event.id, userId },
      });

      return { ok: true as const, isRegistered: false as const };
    }),
});
