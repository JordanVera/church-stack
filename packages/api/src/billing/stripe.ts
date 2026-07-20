import Stripe from 'stripe';
import type { PlanTierId } from '@repo/config';
import { PLAN_TIERS } from '@repo/config';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Env price IDs mapped to product tiers. */
export function priceIdForPlanTier(tier: PlanTierId): string | null {
  switch (tier) {
    case 'SITE':
      return process.env.STRIPE_PRICE_SITE ?? null;
    case 'GROWTH':
      return process.env.STRIPE_PRICE_GROWTH ?? null;
    case 'CUSTOM':
      return process.env.STRIPE_PRICE_CUSTOM ?? null;
    default:
      return null;
  }
}

export function planTierForPriceId(priceId: string): PlanTierId | null {
  const site = process.env.STRIPE_PRICE_SITE;
  const growth = process.env.STRIPE_PRICE_GROWTH;
  const custom = process.env.STRIPE_PRICE_CUSTOM;
  if (site && priceId === site) return 'SITE';
  if (growth && priceId === growth) return 'GROWTH';
  if (custom && priceId === custom) return 'CUSTOM';
  return null;
}

export function listConfiguredPrices(): Array<{
  tier: PlanTierId;
  priceId: string;
  name: string;
  priceLabel: string;
}> {
  return (Object.keys(PLAN_TIERS) as PlanTierId[])
    .map((tier) => {
      const priceId = priceIdForPlanTier(tier);
      if (!priceId) return null;
      const plan = PLAN_TIERS[tier];
      return {
        tier,
        priceId,
        name: plan.name,
        priceLabel: plan.priceLabel,
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}
