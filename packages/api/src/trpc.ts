import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { isPlatformDev } from './platform-dev';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

/** Open to anyone. */
export const publicProcedure = t.procedure;

/** Requires a signed-in user. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * Platform engineer only (`PLATFORM_DEV_EMAILS` / `ALLOW_DEV_CONSOLE`).
 * Returns NOT_FOUND so the surface does not advertise itself.
 */
export const devProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isPlatformDev(ctx.session.user?.email)) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }
  return next({ ctx });
});

/**
 * Signed-in user who may administer a church.
 * Handlers must call `assertChurchAdmin(ctx, churchId)` (or BySlug) before mutating.
 * Prefer this over bare `tenantProcedure` for owner dashboard writes.
 */
export const churchAdminProcedure = protectedProcedure;

/**
 * Requires a resolved tenant. Accepts either `x-church-id` or `x-church-slug`
 * and guarantees a non-null `churchId` downstream.
 * Public/read surfaces only — do not use for owner CMS writes.
 */
export const tenantProcedure = t.procedure.use(async ({ ctx, next }) => {
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

  return next({ ctx: { ...ctx, churchId } });
});
