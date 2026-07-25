import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, tenantProcedure } from '../trpc';
import type { Context } from '../context';
import { notifyByEmail } from '../notify';

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

/** Send Expo push notifications; best-effort, never throws to callers. */
async function sendExpoPush(
  tokens: string[],
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  if (tokens.length === 0) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        tokens.map((to) => ({
          to,
          sound: 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }))
      ),
    });
  } catch (err) {
    console.error('[push] Expo send failed:', err instanceof Error ? err.message : err);
  }
}

export async function notifyChurchMembersOfAnnouncement(opts: {
  prisma: Context['prisma'];
  churchId: string;
  title: string;
  body: string;
  announcementId: string;
}) {
  const tokens = await opts.prisma.deviceToken.findMany({
    where: {
      OR: [{ churchId: opts.churchId }, { churchId: null }],
      user: { memberships: { some: { churchId: opts.churchId } } },
    },
    select: { token: true },
    take: 500,
  });
  const unique = Array.from(new Set(tokens.map((t) => t.token)));
  await sendExpoPush(unique, {
    title: opts.title,
    body: opts.body.slice(0, 160),
    data: { type: 'announcement', id: opts.announcementId },
  });
}

export const engagementRouter = router({
  registerDeviceToken: protectedProcedure
    .input(
      z.object({
        token: z.string().min(8).max(512),
        platform: z.enum(['ios', 'android', 'web', 'unknown']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      let churchId: string | null = null;
      try {
        churchId = await resolveTenantChurchId(ctx);
      } catch {
        churchId = null;
      }

      await ctx.prisma.deviceToken.upsert({
        where: { token: input.token },
        create: {
          userId,
          churchId,
          token: input.token,
          platform: input.platform ?? 'unknown',
        },
        update: {
          userId,
          churchId,
          platform: input.platform ?? 'unknown',
        },
      });
      return { ok: true as const };
    }),

  submitPrayerRequest: protectedProcedure
    .input(z.object({ body: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const churchId = await resolveTenantChurchId(ctx);
      const userId = ctx.session!.user!.id;
      const row = await ctx.prisma.prayerRequest.create({
        data: {
          churchId,
          userId,
          body: input.body.trim(),
        },
      });

      const church = await ctx.prisma.church.findUnique({
        where: { id: churchId },
        select: {
          name: true,
          contactEmail: true,
          adminEmails: { select: { email: true }, take: 20 },
          memberships: {
            where: { role: { in: ['OWNER', 'ADMIN'] } },
            select: { user: { select: { email: true } } },
            take: 20,
          },
        },
      });
      if (church) {
        const recipients = new Set<string>();
        if (church.contactEmail) recipients.add(church.contactEmail);
        for (const a of church.adminEmails) recipients.add(a.email);
        for (const m of church.memberships) {
          if (m.user.email) recipients.add(m.user.email);
        }
        void notifyByEmail({
          to: Array.from(recipients),
          subject: `Prayer request — ${church.name}`,
          text: input.body.trim(),
        }).catch(() => undefined);
      }

      return row;
    }),

  myPrayerRequests: protectedProcedure.query(async ({ ctx }) => {
    const churchId = await resolveTenantChurchId(ctx);
    const userId = ctx.session!.user!.id;
    return ctx.prisma.prayerRequest.findMany({
      where: { churchId, userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }),

  expressGroupInterest: protectedProcedure
    .input(
      z.object({
        lifeGroupId: z.string().min(1),
        notes: z.string().max(2000).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const churchId = await resolveTenantChurchId(ctx);
      const userId = ctx.session!.user!.id;

      const group = await ctx.prisma.lifeGroup.findFirst({
        where: { id: input.lifeGroupId, churchId },
        select: { id: true, name: true },
      });
      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Life group not found' });
      }

      try {
        await ctx.prisma.lifeGroupInterest.create({
          data: {
            churchId,
            lifeGroupId: group.id,
            userId,
            notes: input.notes?.trim() || null,
          },
        });
      } catch {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already expressed interest in this group.',
        });
      }

      return { ok: true as const, interested: true as const };
    }),

  myGroupInterests: tenantProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) return [] as { lifeGroupId: string }[];
    return ctx.prisma.lifeGroupInterest.findMany({
      where: { churchId: ctx.churchId, userId },
      select: { lifeGroupId: true },
    });
  }),
});
