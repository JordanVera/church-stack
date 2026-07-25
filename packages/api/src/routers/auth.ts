import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { isPlatformDev } from '../platform-dev';
import { assertRateLimit, rateLimitExceededMessage } from '../rate-limit';
import { signMobileToken } from '../mobile-jwt';
import { notifyByEmail } from '../notify';
import { prisma } from '@repo/database';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function passwordResetIdentifier(userId: string) {
  return `password-reset:${userId}`;
}

function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

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

  /**
   * Request a password-reset email. Always returns ok (no email enumeration).
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const email = input.email.trim();
      const emailKey = email.toLowerCase();
      const limited = assertRateLimit({
        key: `auth-forgot:${emailKey}`,
        limit: 5,
        windowMs: 60 * 60 * 1000,
      });
      if (!limited.ok) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimitExceededMessage(limited.retryAfterSec),
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { email: emailKey }],
          password: { not: null },
        },
        select: { id: true, email: true },
      });

      if (user?.email) {
        const identifier = passwordResetIdentifier(user.id);
        const rawToken = randomBytes(32).toString('base64url');
        const tokenHash = hashPasswordResetToken(rawToken);
        const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

        await prisma.verificationToken.deleteMany({ where: { identifier } });
        await prisma.verificationToken.create({
          data: { identifier, token: tokenHash, expires },
        });

        const resetUrl = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
        await notifyByEmail({
          to: [user.email],
          subject: 'Reset your Church Stack password',
          text: [
            'We received a request to reset your Church Stack password.',
            '',
            'Open this link to choose a new password (expires in 1 hour):',
            resetUrl,
            '',
            'If you use the mobile app, you can also open Forgot password → Reset password and paste this code:',
            rawToken,
            '',
            'If you did not request this, you can ignore this email.',
          ].join('\n'),
        });
      }

      return { ok: true as const };
    }),

  /** Consume a password-reset token and set a new password. */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const tokenHash = hashPasswordResetToken(input.token.trim());
      const limited = assertRateLimit({
        key: `auth-reset:${tokenHash.slice(0, 24)}`,
        limit: 10,
        windowMs: 60 * 60 * 1000,
      });
      if (!limited.ok) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimitExceededMessage(limited.retryAfterSec),
        });
      }

      const record = await prisma.verificationToken.findUnique({
        where: { token: tokenHash },
      });
      if (!record || !record.identifier.startsWith('password-reset:')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link is invalid or has expired.',
        });
      }
      if (record.expires.getTime() < Date.now()) {
        await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link is invalid or has expired.',
        });
      }

      const userId = record.identifier.slice('password-reset:'.length);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link is invalid or has expired.',
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { password: passwordHash },
        }),
        prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } }),
      ]);

      return { ok: true as const };
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
                tagline: true,
                logoUrl: true,
                address: true,
                planTier: true,
                websiteStatus: true,
                websiteUrl: true,
                givingUrl: true,
                customDomain: true,
                mobilePlan: true,
                mobileBuildStatus: true,
                _count: { select: { locations: true } },
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
