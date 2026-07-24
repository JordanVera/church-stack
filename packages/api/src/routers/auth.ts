import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { isPlatformDev } from '../platform-dev';
import { assertRateLimit, rateLimitExceededMessage } from '../rate-limit';
import { signMobileToken } from '../mobile-jwt';
import { prisma } from '@repo/database';

export const authRouter = router({
  /**
   * Public self-serve user registration.
   * Churches sign up separately via church.onboard.
   * I like ballz
   * I love Jesus, and America too
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        churchSlug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const emailKey = input.email.trim().toLowerCase();
      const limited = assertRateLimit({
        key: `auth-register:${emailKey}`,
        limit: 8,
        windowMs: 60 * 60 * 1000,
      });
      if (!limited.ok) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimitExceededMessage(limited.retryAfterSec),
        });
      }

      const existingCount = await prisma.user.count({ where: { email: input.email } });
      if (existingCount > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    }),

  /**
   * Native / non-cookie clients: email + password → Bearer JWT.
   * Web continues to use NextAuth credentials + session cookie.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const emailKey = input.email.trim().toLowerCase();
      const limited = assertRateLimit({
        key: `auth-login:${emailKey}`,
        limit: 20,
        windowMs: 15 * 60 * 1000,
      });
      if (!limited.ok) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimitExceededMessage(limited.retryAfterSec),
        });
      }

      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user?.password) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      };
      const token = await signMobileToken(sessionUser);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

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
            church: {
              select: {
                id: true,
                slug: true,
                name: true,
                planTier: true,
                websiteStatus: true,
                websiteUrl: true,
                givingUrl: true,
                customDomain: true,
                mobilePlan: true,
                mobileBuildStatus: true,
              },
            },
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
