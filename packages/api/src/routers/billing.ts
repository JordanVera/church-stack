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

async function createElementsCheckoutSession(
  stripe: ReturnType<typeof getStripe>,
  args: {
    mode: 'subscription';
    priceId: string;
    returnUrl: string;
    metadata: Record<string, string>;
    subscriptionMetadata: Record<string, string>;
    customerId?: string;
    customerEmail?: string;
  }
) {
  const session = await stripe.checkout.sessions.create({
    mode: args.mode,
    ui_mode: 'elements',
    line_items: [{ price: args.priceId, quantity: 1 }],
    return_url: args.returnUrl,
    metadata: args.metadata,
    subscription_data: {
      metadata: args.subscriptionMetadata,
    },
    ...(args.customerId
      ? { customer: args.customerId }
      : args.customerEmail
        ? { customer_email: args.customerEmail }
        : {}),
  });

  if (!session.client_secret) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe did not return a client secret',
    });
  }

  return { clientSecret: session.client_secret, sessionId: session.id };
}

async function createCheckoutForChurch(
  prisma: PrismaClient,
  args: {
    church: Church;
    planTier: PlanTierId;
    customerEmail?: string | null;
    returnUrl: string;
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

  return createElementsCheckoutSession(stripe, {
    mode: 'subscription',
    priceId,
    returnUrl: args.returnUrl,
    customerId,
    metadata: {
      churchId: args.church.id,
      planTier: args.planTier,
    },
    subscriptionMetadata: {
      churchId: args.church.id,
      planTier: args.planTier,
    },
  });
}

async function createPreOnboardCheckout(
  prisma: PrismaClient,
  args: {
    userId: string;
    customerEmail: string;
    planTier: PlanTierId;
    returnUrl: string;
  }
) {
  const priceId = priceIdForPlanTier(args.planTier);
  if (!priceId) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: `Missing Stripe price env for plan ${args.planTier}`,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: {
      pendingStripeSubscriptionId: true,
      pendingPlanTier: true,
    },
  });

  if (user?.pendingStripeSubscriptionId) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'You already have an active subscription awaiting church registration. Continue to register your church.',
    });
  }

  const stripe = getStripe();
  return createElementsCheckoutSession(stripe, {
    mode: 'subscription',
    priceId,
    returnUrl: args.returnUrl,
    customerEmail: args.customerEmail,
    metadata: {
      userId: args.userId,
      planTier: args.planTier,
      flow: 'pre_onboard',
    },
    subscriptionMetadata: {
      userId: args.userId,
      planTier: args.planTier,
      flow: 'pre_onboard',
    },
  });
}

/** Store a completed pre-onboard checkout on the user until church registration. */
export async function applyPreOnboardCheckoutToUser(
  prisma: PrismaClient,
  args: {
    userId: string;
    planTier: PlanTierId;
    customerId?: string | null;
    subscriptionId: string;
    priceId: string | null;
  }
) {
  await prisma.user.update({
    where: { id: args.userId },
    data: {
      pendingPlanTier: args.planTier,
      pendingStripeCustomerId: args.customerId ?? null,
      pendingStripeSubscriptionId: args.subscriptionId,
      pendingStripePriceId: args.priceId,
    },
  });
}

/** Move pending subscription from user onto a newly registered church. */
export async function applyPendingSubscriptionFromUser(
  prisma: PrismaClient,
  args: { userId: string; churchId: string }
) {
  const user = await prisma.user.findUnique({
    where: { id: args.userId },
    select: {
      pendingPlanTier: true,
      pendingStripeCustomerId: true,
      pendingStripeSubscriptionId: true,
      pendingStripePriceId: true,
    },
  });

  if (!user?.pendingStripeSubscriptionId || !user.pendingPlanTier) {
    return null;
  }

  const tier = user.pendingPlanTier as PlanTierId;
  const defaults = planTierDefaults(tier);

  await prisma.$transaction([
    prisma.church.update({
      where: { id: args.churchId },
      data: {
        ...defaults,
        stripeCustomerId: user.pendingStripeCustomerId,
        stripeSubscriptionId: user.pendingStripeSubscriptionId,
        stripePriceId: user.pendingStripePriceId,
      },
    }),
    prisma.user.update({
      where: { id: args.userId },
      data: {
        pendingPlanTier: null,
        pendingStripeCustomerId: null,
        pendingStripeSubscriptionId: null,
        pendingStripePriceId: null,
      },
    }),
  ]);

  const stripe = getStripe();
  try {
    await stripe.subscriptions.update(user.pendingStripeSubscriptionId, {
      metadata: {
        churchId: args.churchId,
        planTier: tier,
        flow: 'pre_onboard',
      },
    });
    if (user.pendingStripeCustomerId) {
      await stripe.customers.update(user.pendingStripeCustomerId, {
        metadata: {
          churchId: args.churchId,
        },
      });
    }
  } catch {
    // Non-fatal — church row already has subscription ids.
  }

  return tier;
}

async function retrieveCheckoutSessionStatusForUser(
  sessionId: string,
  userId: string
): Promise<{ status: string; paymentStatus: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const ownerUserId = session.metadata?.userId;
  if (ownerUserId && ownerUserId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your checkout session' });
  }

  return {
    status: String(session.status ?? 'unknown'),
    paymentStatus: String(session.payment_status ?? 'unknown'),
  };
}

function parsePlanTierFromMetadata(
  metadata: Record<string, string> | null | undefined
): PlanTierId | null {
  const tier = metadata?.planTier;
  if (tier === 'SITE' || tier === 'GROWTH' || tier === 'CUSTOM') return tier;
  return null;
}

function subscriptionPriceId(subscription: {
  items: { data: Array<{ price?: string | { id: string } | null }> };
}): string | null {
  const item = subscription.items.data[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === 'string' ? price : price.id;
}

/**
 * Fallback when Stripe webhooks are unavailable (local dev / ngrok not wired).
 * Reads a completed Checkout Session from Stripe and stores pending billing on the user.
 */
async function syncPreOnboardFromCheckoutSession(
  prisma: PrismaClient,
  args: { sessionId: string; userId: string }
): Promise<{ synced: boolean; canOnboard: boolean; paidPlanTier: PlanTierId | null }> {
  const existing = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { pendingStripeSubscriptionId: true, pendingPlanTier: true },
  });

  if (existing?.pendingStripeSubscriptionId && existing.pendingPlanTier) {
    return {
      synced: true,
      canOnboard: true,
      paidPlanTier: existing.pendingPlanTier as PlanTierId,
    };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(args.sessionId, {
    expand: ['subscription'],
  });

  const ownerUserId = session.metadata?.userId;
  if (ownerUserId && ownerUserId !== args.userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your checkout session' });
  }

  if (session.metadata?.flow !== 'pre_onboard') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not a pre-onboard checkout session' });
  }

  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    return { synced: false, canOnboard: false, paidPlanTier: null };
  }

  const planTier = parsePlanTierFromMetadata(session.metadata);
  if (!planTier) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing plan on checkout session' });
  }

  const subscriptionRef = session.subscription;
  const subscriptionId =
    typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id;

  if (!subscriptionId) {
    return { synced: false, canOnboard: false, paidPlanTier: null };
  }

  let priceId: string | null = null;
  if (subscriptionRef && typeof subscriptionRef !== 'string') {
    priceId = subscriptionPriceId(subscriptionRef);
  } else {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    priceId = subscriptionPriceId(subscription);
  }

  const resolvedPriceId = priceId ?? priceIdForPlanTier(planTier);

  await applyPreOnboardCheckoutToUser(prisma, {
    userId: args.userId,
    planTier,
    customerId:
      typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
    subscriptionId,
    priceId: resolvedPriceId,
  });

  return { synced: true, canOnboard: true, paidPlanTier: planTier };
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

  /** Whether the signed-in user has paid and can register a church for the given plan. */
  preOnboardStatus: protectedProcedure
    .input(
      z.object({
        planTier: planTierSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user!.id },
        select: {
          pendingPlanTier: true,
          pendingStripeSubscriptionId: true,
        },
      });

      const hasPaid = Boolean(user?.pendingStripeSubscriptionId);
      const paidPlanTier = user?.pendingPlanTier ?? null;
      const requestedPlan = input.planTier ?? null;
      const canOnboard = hasPaid && (!requestedPlan || paidPlanTier === requestedPlan);

      return {
        hasPaid,
        paidPlanTier,
        canOnboard,
        configured: isStripeConfigured(),
        priceConfigured: requestedPlan ? Boolean(priceIdForPlanTier(requestedPlan)) : null,
      };
    }),

  /** Start embedded Stripe Checkout before church registration (payment-first signup). */
  createPreOnboardCheckout: protectedProcedure
    .input(
      z.object({
        planTier: planTierSchema,
        returnUrl: z.string().url(),
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
      const email = user.email?.trim();
      if (!email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Your account needs an email address to subscribe.',
        });
      }

      return createPreOnboardCheckout(ctx.prisma, {
        userId: user.id,
        customerEmail: email,
        planTier: input.planTier,
        returnUrl: input.returnUrl,
      });
    }),

  /** Poll checkout session status after embedded payment (return URL). */
  checkoutSessionStatus: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return retrieveCheckoutSessionStatusForUser(input.sessionId, ctx.session.user!.id);
    }),

  /**
   * Sync paid pre-onboard checkout into the DB when webhooks haven't fired yet.
   * Pass the session_id from the Stripe return URL.
   */
  syncPreOnboardPayment: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Stripe is not configured.',
        });
      }

      return syncPreOnboardFromCheckoutSession(ctx.prisma, {
        sessionId: input.sessionId,
        userId: ctx.session.user!.id,
      });
    }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        churchId: z.string().min(1),
        planTier: planTierSchema,
        returnUrl: z.string().url(),
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
        returnUrl: input.returnUrl,
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
        returnUrl: z.string().url(),
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
        returnUrl: input.returnUrl,
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
    { id: string } | { stripeCustomerId: string } | { stripeSubscriptionId: string }
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
