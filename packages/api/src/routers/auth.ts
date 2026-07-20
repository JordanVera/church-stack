import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const authRouter = router({
  // Register a new user and optionally attach them to a church as a MEMBER.
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        churchSlug: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use.' });
      }

      const password = await bcrypt.hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: { name: input.name, email: input.email, password },
      });

      if (input.churchSlug) {
        const church = await ctx.prisma.church.findUnique({
          where: { slug: input.churchSlug },
          select: { id: true },
        });
        if (church) {
          await ctx.prisma.membership.create({
            data: { userId: user.id, churchId: church.id },
          });
        }
      }

      return { id: user.id, email: user.email, name: user.name };
    }),

  // Current user + the churches they belong to.
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user!.id;
    return ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        memberships: {
          select: {
            role: true,
            church: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });
  }),
});
