/**
 * Productized plan tiers and feature gates.
 * Single source of truth for marketing, billing, and API enforcement.
 */

export type PlanTierId = 'SITE' | 'GROWTH' | 'CUSTOM';

export interface PlanDefinition {
  id: PlanTierId;
  name: string;
  /** Display price for marketing (Stripe price IDs live in env). */
  priceMonthlyUsd: number | null;
  priceLabel: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  /** Soft campus limit included in the tier (null = unlimited). */
  maxCampuses: number | null;
  entitlements: PlanEntitlements;
}

export interface PlanEntitlements {
  whiteLabelSite: boolean;
  whiteLabelMobile: boolean;
  customDomain: boolean;
  planningCenterSync: boolean;
  events: boolean;
  sermons: boolean;
  giving: boolean;
  customNextSite: boolean;
  prioritySupport: boolean;
}

export const PLAN_TIERS: Record<PlanTierId, PlanDefinition> = {
  SITE: {
    id: 'SITE',
    name: 'Site',
    priceMonthlyUsd: 129,
    priceLabel: '$129',
    period: '/mo',
    description:
      'White-label website and church-named mobile apps, with your content hosted for you.',
    features: [
      'White-label website on your domain',
      'White-label iOS & Android apps',
      'Hosted content (events, announcements, locations)',
      'Sermon series',
      'Planning Center sync (optional)',
      'Email support',
    ],
    cta: 'Choose Site',
    highlighted: false,
    maxCampuses: 2,
    entitlements: {
      whiteLabelSite: true,
      whiteLabelMobile: true,
      customDomain: true,
      planningCenterSync: true,
      events: true,
      sermons: true,
      giving: false,
      customNextSite: false,
      prioritySupport: false,
    },
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Growth',
    priceMonthlyUsd: 249,
    priceLabel: '$249',
    period: '/mo',
    description: 'Everything in Site, plus giving and priority support.',
    features: [
      'Everything in Site',
      'Giving integration',
      'Richer site content types',
      'Faster white-label build cadence',
      'Priority support',
    ],
    cta: 'Choose Growth',
    highlighted: true,
    maxCampuses: 5,
    entitlements: {
      whiteLabelSite: true,
      whiteLabelMobile: true,
      customDomain: true,
      planningCenterSync: true,
      events: true,
      sermons: true,
      giving: true,
      customNextSite: false,
      prioritySupport: true,
    },
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Custom',
    priceMonthlyUsd: 599,
    priceLabel: 'From $599',
    period: '/mo',
    description: 'Fully custom Next.js website with the same shared platform data.',
    features: [
      'Everything in Growth',
      'Fully custom Next.js website',
      'Custom features & integrations',
      'Planning Center when needed',
      'Dedicated support',
      'Same DB as your mobile apps',
    ],
    cta: 'Contact sales',
    highlighted: false,
    maxCampuses: null,
    entitlements: {
      whiteLabelSite: true,
      whiteLabelMobile: true,
      customDomain: true,
      planningCenterSync: true,
      events: true,
      sermons: true,
      giving: true,
      customNextSite: true,
      prioritySupport: true,
    },
  },
};

export const PLAN_TIER_LIST: PlanDefinition[] = [
  PLAN_TIERS.SITE,
  PLAN_TIERS.GROWTH,
  PLAN_TIERS.CUSTOM,
];

export function getPlan(tier: PlanTierId): PlanDefinition {
  return PLAN_TIERS[tier];
}

/** Defaults applied to Church feature flags when a tier is set. */
export function planTierDefaults(tier: PlanTierId): {
  planTier: PlanTierId;
  givingEnabled: boolean;
  eventsEnabled: boolean;
  sermonsEnabled: boolean;
  mobilePlan: 'WHITELABEL';
} {
  const e = getPlan(tier).entitlements;
  return {
    planTier: tier,
    givingEnabled: e.giving,
    eventsEnabled: e.events,
    sermonsEnabled: e.sermons,
    mobilePlan: 'WHITELABEL',
  };
}

export function planAllowsGiving(tier: PlanTierId): boolean {
  return getPlan(tier).entitlements.giving;
}

export function planAllowsCustomSite(tier: PlanTierId): boolean {
  return getPlan(tier).entitlements.customNextSite;
}
