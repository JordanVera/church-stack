import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { isPlatformDev } from '../platform-dev';

export const authRouter = router({
  /**
   * Public self-serve user registration is disabled.
   * Platform admins/devs are created manually in the User table; churches sign up via church.onboard.
   */
  register: publicProcedure.input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
      churchSlug: z.string().optional(),
    })
  ),
  // .mutation(async () => {
  //   throw new TRPCError({
  //     code: 'FORBIDDEN',
  //     message: 'User signup is disabled. Register your church instead.',
  //   });
  // })
  // Current user + the churches they belong to.
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user!.id;
    const user = await ctx.prisma.user.findUnique({
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
    if (!user) return null;
    return {
      ...user,
      isDev: isPlatformDev(user.email),
    };
  }),
});
