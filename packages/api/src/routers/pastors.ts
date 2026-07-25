import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, churchAdminProcedure } from '../trpc';
import { assertChurchAdmin } from '../church-admin';

/** Empty string / null → null; omit (undefined) stays undefined for partial updates. */
const optionalUrlSchema = z.union([z.string().url().max(500), z.literal(''), z.null()]).optional();

function normalizeOptionalUrl(v: string | null | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return v;
}

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
        photoUrl: optionalUrlSchema,
        facebookUrl: optionalUrlSchema,
        instagramUrl: optionalUrlSchema,
        youtubeUrl: optionalUrlSchema,
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
          photoUrl: normalizeOptionalUrl(input.photoUrl) ?? null,
          facebookUrl: normalizeOptionalUrl(input.facebookUrl) ?? null,
          instagramUrl: normalizeOptionalUrl(input.instagramUrl) ?? null,
          youtubeUrl: normalizeOptionalUrl(input.youtubeUrl) ?? null,
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
        photoUrl: optionalUrlSchema,
        facebookUrl: optionalUrlSchema,
        instagramUrl: optionalUrlSchema,
        youtubeUrl: optionalUrlSchema,
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
          photoUrl: normalizeOptionalUrl(input.photoUrl),
          facebookUrl: normalizeOptionalUrl(input.facebookUrl),
          instagramUrl: normalizeOptionalUrl(input.instagramUrl),
          youtubeUrl: normalizeOptionalUrl(input.youtubeUrl),
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
