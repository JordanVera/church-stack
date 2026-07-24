/**
 * Shared whitelabel / tenant branding contract.
 *
 * This is the single source of truth for the *shape* of a church's branding.
 * It is intentionally decoupled from Prisma so both web and native can depend
 * on it without pulling in the database client. The `toTenantBranding` helper
 * maps a `Church` row (a structurally-compatible subset) into this shape.
 */

export {
  PLAN_TIERS,
  PLAN_TIER_LIST,
  getPlan,
  planTierDefaults,
  planAllowsGiving,
  planAllowsCustomSite,
} from './plans';
export type { PlanTierId, PlanDefinition, PlanEntitlements } from './plans';

export type SiteThemeDefault = 'light' | 'dark';

export interface TenantBranding {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  /** Default light/dark mode for the white-label site (visitors can still toggle). */
  themeDefault: SiteThemeDefault;
  contactEmail: string | null;
  /** External giving URL when configured; public Give UI only when set. */
  givingUrl: string | null;
  features: TenantFeatures;
}

export interface TenantFeatures {
  giving: boolean;
  events: boolean;
  sermons: boolean;
}

/** Fallback branding used before a tenant is resolved (or in dev). */
export const DEFAULT_BRANDING: TenantBranding = {
  slug: 'default',
  name: 'Church Stack',
  tagline: 'Your church, your app.',
  logoUrl: null,
  primaryColor: '#1a8bbd',
  secondaryColor: '#84dccf',
  themeDefault: 'light',
  contactEmail: null,
  givingUrl: null,
  features: {
    giving: true,
    events: true,
    sermons: true,
  },
};

/** Minimal shape of a Church row needed to derive branding. */
export interface ChurchBrandingSource {
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  siteThemeDefault?: 'LIGHT' | 'DARK' | null;
  contactEmail?: string | null;
  givingUrl?: string | null;
  givingEnabled?: boolean;
  eventsEnabled?: boolean;
  sermonsEnabled?: boolean;
}

function toThemeDefault(value?: 'LIGHT' | 'DARK' | null): SiteThemeDefault {
  return value === 'DARK' ? 'dark' : 'light';
}

export function toTenantBranding(church: ChurchBrandingSource): TenantBranding {
  return {
    slug: church.slug,
    name: church.name,
    tagline: church.tagline ?? null,
    logoUrl: church.logoUrl ?? null,
    primaryColor: church.primaryColor ?? DEFAULT_BRANDING.primaryColor,
    secondaryColor: church.secondaryColor ?? DEFAULT_BRANDING.secondaryColor,
    themeDefault: toThemeDefault(church.siteThemeDefault),
    contactEmail: church.contactEmail ?? null,
    givingUrl: church.givingUrl ?? null,
    features: {
      giving: church.givingEnabled ?? true,
      events: church.eventsEnabled ?? true,
      sermons: church.sermonsEnabled ?? true,
    },
  };
}
