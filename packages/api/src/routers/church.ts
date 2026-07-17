import { z } from 'zod';
import { toTenantBranding } from '@repo/config';
import { router, publicProcedure } from '../trpc';

export const churchRouter = router({
  // List active churches (used by the native church picker).
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.church.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, slug: true, name: true, tagline: true, logoUrl: true },
    });
  }),

  // Resolve whitelabel branding for a single tenant by slug.
  getBranding: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const church = await ctx.prisma.church.findUnique({
        where: { slug: input.slug },
      });
      if (!church) return null;
      return toTenantBranding(church);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.church.findUnique({ where: { id: input.id } });
    }),
});
