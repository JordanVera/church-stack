import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { planTierDefaults, type PlanTierId } from '@repo/config';
import type { Church, PrismaClient } from '@repo/database';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { isPlatformDev } from '../platform-dev';
import {
  getStripe,
  isStripeConfigured,
  listConfiguredPrices,
  planTierForPriceId,
  priceIdForPlanTier,
} from '../billing/stripe';

const planTierSchema = z.enum(['SITE', 'GROWTH', 'CUSTOM']);

async function assertChurchAccess(
  prisma: PrismaClient,
  userId: string,
  churchId: string,
  opts: { isPlatformAdmin: boolean; email?: string | null }
) {
  const church = await prisma.church.findUnique({ where: { id: churchId } });
  if (!church) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
  }
  if (opts.isPlatformAdmin || isPlatformDev(opts.email)) return church;

  const membership = await prisma.membership.findUnique({
    where: { userId_churchId: { userId, churchId } },
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed for this church' });
  }
  return church;
}

async function createCheckoutForChurch(
  prisma: PrismaClient,
  args: {
    church: Church;
    planTier: PlanTierId;
    customerEmail?: string | null;
    successUrl: string;
    cancelUrl: string;
  }
) {
  const priceId = priceIdForPlanTier(args.planTier);
  if (!priceId) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Missing Stripe price env for plan ${args.planTier}`,
    });
  }

  const stripe = getStripe();
  let customerId = args.church.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: args.customerEmail ?? args.church.contactEmail ?? undefined,
      name: args.church.name,
      metadata: {
        churchId: args.church.id,
        churchSlug: args.church.slug,
      },
    });
    customerId = customer.id;
    await prisma.church.update({
      where: { id: args.church.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: {
      churchId: args.church.id,
      planTier: args.planTier,
    },
    subscription_data: {
      metadata: {
        churchId: args.church.id,
        planTier: args.planTier,
      },
    },
  });

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe did not return a checkout URL',
    });
  }

  return { url: session.url, sessionId: session.id };
}

export const billingRouter = router({
  /** Public catalog for pricing page / checkout UI. */
  catalog: publicProcedure.query(() => {
    return {
      configured: isStripeConfigured(),
      prices: listConfiguredPrices(),
    };
  }),

  /** Public church summary for the subscribe page. */
  subscribePreview: publicProcedure
    .input(
      z.object({
        churchId: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        planTier: planTierSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.churchId && !input.slug) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Provide churchId or slug',
        });
      }

      const church = await ctx.prisma.church.findFirst({
        where: input.churchId ? { id: input.churchId } : { slug: input.slug },
        select: {
          id: true,
          slug: true,
          name: true,
          planTier: true,
          stripeSubscriptionId: true,
        },
      });

      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }

      const { stripeSubscriptionId: _subId, ...publicChurch } = church;

      return {
        church: publicChurch,
        hasSubscription: Boolean(_subId),
        configured: isStripeConfigured(),
        requestedPlan: input.planTier ?? null,
        priceConfigured: input.planTier ? Boolean(priceIdForPlanTier(input.planTier)) : null,
      };
    }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        planTier: planTierSchema,
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured. Set STRIPE_SECRET_KEY and price env vars.',
        });
      }

      const user = ctx.session.user!;
      const church = await assertChurchAccess(ctx.prisma, user.id, input.churchId, {
        isPlatformAdmin: Boolean(user.isAdmin),
        email: user.email,
      });

      return createCheckoutForChurch(ctx.prisma, {
        church,
        planTier: input.planTier,
        customerEmail: user.email,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });
    }),

  /**
   * For church admins listed on the church during onboard:
   * claim OWNER membership (if needed) then start Stripe Checkout.
   */
  claimAndCheckout: protectedProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        planTier: planTierSchema,
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured. Set STRIPE_SECRET_KEY and price env vars.',
        });
      }

      const user = ctx.session.user!;
      const email = user.email?.trim().toLowerCase();
      if (!email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your account needs an email address to subscribe.',
        });
      }

      const church = await ctx.prisma.church.findUnique({ where: { id: input.churchId } });
      if (!church) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
      }

      const isStaff = Boolean(user.isAdmin) || isPlatformDev(user.email);
      const membership = await ctx.prisma.membership.findUnique({
        where: { userId_churchId: { userId: user.id, churchId: church.id } },
      });

      if (!membership && !isStaff) {
        const adminEmail = await ctx.prisma.churchAdminEmail.findFirst({
          where: { churchId: church.id, email },
        });
        if (!adminEmail) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Sign in with an admin email listed for this church during signup to start billing.',
          });
        }

        await ctx.prisma.membership.create({
          data: {
            userId: user.id,
            churchId: church.id,
            role: 'OWNER',
          },
        });
      } else if (
        membership &&
        membership.role !== 'OWNER' &&
        membership.role !== 'ADMIN' &&
        !isStaff
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed for this church' });
      }

      return createCheckoutForChurch(ctx.prisma, {
        church,
        planTier: input.planTier,
        customerEmail: user.email,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });
    }),

  createPortalSession: protectedProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        returnUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured.',
        });
      }

      const user = ctx.session.user!;
      const church = await assertChurchAccess(ctx.prisma, user.id, input.churchId, {
        isPlatformAdmin: Boolean(user.isAdmin),
        email: user.email,
      });

      if (!church.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Stripe customer on this church yet. Start a checkout first.',
        });
      }

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: church.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),
});

/** Apply subscription state from Stripe webhooks onto the Church row. */
export async function applyStripeSubscriptionToChurch(
  prisma: PrismaClient,
  args: {
    churchId?: string | null;
    customerId?: string | null;
    subscriptionId: string;
    priceId: string | null;
    status: string;
  }
) {
  const or: Array<
    | { id: string }
    | { stripeCustomerId: string }
    | { stripeSubscriptionId: string }
  > = [];
  if (args.churchId) or.push({ id: args.churchId });
  if (args.customerId) or.push({ stripeCustomerId: args.customerId });
  or.push({ stripeSubscriptionId: args.subscriptionId });

  const church = await prisma.church.findFirst({ where: { OR: or } });
  if (!church) return null;

  const active = args.status === 'active' || args.status === 'trialing';
  const tier = args.priceId ? planTierForPriceId(args.priceId) : null;

  if (active && tier) {
    const defaults = planTierDefaults(tier);
    await prisma.church.update({
      where: { id: church.id },
      data: {
        ...defaults,
        stripeCustomerId: args.customerId ?? undefined,
        stripeSubscriptionId: args.subscriptionId,
        stripePriceId: args.priceId,
      },
    });
  } else if (
    args.status === 'canceled' ||
    args.status === 'unpaid' ||
    args.status === 'incomplete_expired'
  ) {
    const siteDefaults = planTierDefaults('SITE');
    await prisma.church.update({
      where: { id: church.id },
      data: {
        ...siteDefaults,
        stripeSubscriptionId: null,
        stripePriceId: null,
      },
    });
  } else {
    await prisma.church.update({
      where: { id: church.id },
      data: {
        stripeCustomerId: args.customerId ?? undefined,
        stripeSubscriptionId: args.subscriptionId,
        stripePriceId: args.priceId,
      },
    });
  }

  return church.id;
}
