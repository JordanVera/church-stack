import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { planTierDefaults, type PlanTierId } from '@repo/config';
import type { PrismaClient } from '@repo/database';
import { router, protectedProcedure, publicProcedure } from '../trpc';
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
  isPlatformAdmin: boolean
) {
  const church = await prisma.church.findUnique({ where: { id: churchId } });
  if (!church) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Church not found' });
  }
  if (isPlatformAdmin) return church;

  const membership = await prisma.membership.findUnique({
    where: { userId_churchId: { userId, churchId } },
  });
  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not allowed for this church' });
  }
  return church;
}

export const billingRouter = router({
  /** Public catalog for pricing page / checkout UI. */
  catalog: publicProcedure.query(() => {
    return {
      configured: isStripeConfigured(),
      prices: listConfiguredPrices(),
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

      const priceId = priceIdForPlanTier(input.planTier);
      if (!priceId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Missing Stripe price env for plan ${input.planTier}`,
        });
      }

      const user = ctx.session.user!;
      const church = await assertChurchAccess(
        ctx.prisma,
        user.id,
        input.churchId,
        Boolean(user.isAdmin)
      );

      const stripe = getStripe();
      let customerId = church.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? church.contactEmail ?? undefined,
          name: church.name,
          metadata: {
            churchId: church.id,
            churchSlug: church.slug,
          },
        });
        customerId = customer.id;
        await ctx.prisma.church.update({
          where: { id: church.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          churchId: church.id,
          planTier: input.planTier,
        },
        subscription_data: {
          metadata: {
            churchId: church.id,
            planTier: input.planTier,
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
      const church = await assertChurchAccess(
        ctx.prisma,
        user.id,
        input.churchId,
        Boolean(user.isAdmin)
      );

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
    await prisma.church.update({
      where: { id: church.id },
      data: {
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
