import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, churchAdminProcedure } from '../trpc';
import { assertChurchAdmin } from '../church-admin';

const submitInput = z.object({
  slug: z.string().min(1),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional().nullable(),
  /** ISO date YYYY-MM-DD */
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  locationId: z.string().min(1).optional().nullable(),
  serviceId: z.string().min(1).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

function parseVisitDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  // UTC midnight so MySQL DATE stays stable across timezones.
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export const visitPlansRouter = router({
  /**
   * Public: guest submits a "Plan a visit" request from the white-label site.
   */
  submit: publicProcedure.input(submitInput).mutation(async ({ ctx, input }) => {
    const church = await ctx.prisma.church.findFirst({
      where: { slug: input.slug, isActive: true },
      select: { id: true },
    });
    if (!church) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
    }

    const locations = await ctx.prisma.location.findMany({
      where: { churchId: church.id },
      orderBy: { sortOrder: 'asc' },
      include: { services: { orderBy: { sortOrder: 'asc' } } },
    });

    if (locations.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This church has no locations configured yet.',
      });
    }

    let location =
      input.locationId != null
        ? locations.find((l) => l.id === input.locationId) ?? null
        : locations.length === 1
          ? locations[0]!
          : null;

    if (locations.length > 1 && !location) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please choose a location.',
      });
    }
    if (input.locationId && !location) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid location.' });
    }

    location = location ?? locations[0]!;

    let service =
      input.serviceId != null
        ? location.services.find((s) => s.id === input.serviceId) ?? null
        : null;

    if (location.services.length > 0 && !service) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please choose a service.',
      });
    }
    if (input.serviceId && !service) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid service for that location.' });
    }

    const visitDate = parseVisitDate(input.visitDate);
    const todayUtc = new Date();
    const todayDate = new Date(
      Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate())
    );
    if (visitDate < todayDate) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Visit date must be today or later.' });
    }

    if (service) {
      const dayOfWeek = visitDate.getUTCDay();
      if (dayOfWeek !== service.dayOfWeek) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'That date does not match the selected service day.',
        });
      }
    }

    const serviceName = service
      ? `${service.name} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][service.dayOfWeek]} ${service.startTime})`
      : null;

    const created = await ctx.prisma.visitPlan.create({
      data: {
        churchId: church.id,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        visitDate,
        locationId: location.id,
        locationName: location.name,
        serviceId: service?.id ?? null,
        serviceName,
        notes: input.notes?.trim() || null,
      },
      select: { id: true },
    });

    return { ok: true as const, id: created.id };
  }),

  list: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.visitPlan.findMany({
        where: { churchId: input.churchId },
        orderBy: [{ visitDate: 'asc' }, { createdAt: 'desc' }],
        take: 100,
      });
    }),

  delete: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1), id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      const existing = await ctx.prisma.visitPlan.findFirst({
        where: { id: input.id, churchId: input.churchId },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Visit plan not found' });
      }
      await ctx.prisma.visitPlan.delete({ where: { id: existing.id } });
      return { ok: true as const };
    }),
});
