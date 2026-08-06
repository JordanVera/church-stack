import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, churchAdminProcedure } from '../trpc';
import { assertChurchAdmin } from '../church-admin';
import { assertPlatformAdmin } from '../platform-admin';
import { assertRateLimit, rateLimitExceededMessage } from '../rate-limit';
import { notifyByEmail } from '../notify';
import { getPlatformSupportEmail } from '../platform-support';

const categorySchema = z.enum([
  'GENERAL',
  'WEBSITE',
  'MOBILE',
  'PLANNING_CENTER',
  'BILLING',
  'OTHER',
]);

const CATEGORY_LABELS: Record<z.infer<typeof categorySchema>, string> = {
  GENERAL: 'General',
  WEBSITE: 'Website',
  MOBILE: 'Mobile apps',
  PLANNING_CENTER: 'Planning Center',
  BILLING: 'Billing',
  OTHER: 'Other',
};

function formatSupportEmailBody(opts: {
  churchName: string;
  churchSlug: string;
  userName: string | null | undefined;
  userEmail: string;
  category: z.infer<typeof categorySchema>;
  subject: string;
  message: string;
  requestId: string;
}) {
  return [
    `New support request from ${opts.churchName}`,
    '',
    `Church: ${opts.churchName} (/${opts.churchSlug})`,
    `From: ${opts.userName?.trim() || opts.userEmail} <${opts.userEmail}>`,
    `Category: ${CATEGORY_LABELS[opts.category]}`,
    `Subject: ${opts.subject}`,
    '',
    opts.message,
    '',
    `Request ID: ${opts.requestId}`,
    'View and manage in the Gatherly Stack admin dashboard.',
  ].join('\n');
}

export const supportRouter = router({
  submit: churchAdminProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        category: categorySchema.default('GENERAL'),
        subject: z.string().min(1).max(200),
        message: z.string().min(1).max(8000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session?.user;
      if (!user?.id || !user.email) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const limited = assertRateLimit({
        key: `support-submit:${user.id}`,
        limit: 8,
        windowMs: 60 * 60 * 1000,
      });
      if (!limited.ok) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimitExceededMessage(limited.retryAfterSec),
        });
      }

      const church = await assertChurchAdmin(ctx, input.churchId);
      const subject = input.subject.trim();
      const message = input.message.trim();

      const created = await ctx.prisma.supportRequest.create({
        data: {
          churchId: church.id,
          userId: user.id,
          category: input.category,
          subject,
          message,
          userEmail: user.email.trim().toLowerCase(),
          userName: user.name?.trim() || null,
          churchName: church.name,
          churchSlug: church.slug,
        },
        select: { id: true },
      });

      void notifyByEmail({
        to: [getPlatformSupportEmail()],
        subject: `[Gatherly Stack] ${subject} — ${church.name}`,
        text: formatSupportEmailBody({
          churchName: church.name,
          churchSlug: church.slug,
          userName: user.name,
          userEmail: user.email,
          category: input.category,
          subject,
          message,
          requestId: created.id,
        }),
      });

      return { ok: true as const, id: created.id };
    }),

  listForChurch: churchAdminProcedure
    .input(z.object({ churchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertChurchAdmin(ctx, input.churchId);
      return ctx.prisma.supportRequest.findMany({
        where: { churchId: input.churchId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          category: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      });
    }),

  adminList: churchAdminProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'RESOLVED', 'ALL']).default('OPEN'),
          take: z.number().int().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx);
      const status = input?.status ?? 'OPEN';
      const take = input?.take ?? 50;

      return ctx.prisma.supportRequest.findMany({
        where:
          status === 'ALL'
            ? undefined
            : {
                status,
              },
        orderBy: { createdAt: 'desc' },
        take,
      });
    }),

  adminOpenCount: churchAdminProcedure.query(async ({ ctx }) => {
    await assertPlatformAdmin(ctx);
    return ctx.prisma.supportRequest.count({ where: { status: 'OPEN' } });
  }),

  adminResolve: churchAdminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx);
      const existing = await ctx.prisma.supportRequest.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Support request not found' });
      }

      await ctx.prisma.supportRequest.update({
        where: { id: input.id },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });

      return { ok: true as const };
    }),

  adminReopen: churchAdminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx);
      const existing = await ctx.prisma.supportRequest.findUnique({ where: { id: input.id } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Support request not found' });
      }

      await ctx.prisma.supportRequest.update({
        where: { id: input.id },
        data: { status: 'OPEN', resolvedAt: null },
      });

      return { ok: true as const };
    }),
});
