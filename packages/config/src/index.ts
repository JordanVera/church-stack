/**
 * Shared whitelabel / tenant branding contract.
 *
 * This is the single source of truth for the *shape* of a church's branding.
 * It is intentionally decoupled from Prisma so both web and native can depend
 * on it without pulling in the database client. The `toTenantBranding` helper
 * maps a `Church` row (a structurally-compatible subset) into this shape.
 */

export interface TenantBranding {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string | null;
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
  primaryColor: '#ef626c',
  secondaryColor: '#84dccf',
  contactEmail: null,
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
  contactEmail?: string | null;
  givingEnabled?: boolean;
  eventsEnabled?: boolean;
  sermonsEnabled?: boolean;
}

export function toTenantBranding(church: ChurchBrandingSource): TenantBranding {
  return {
    slug: church.slug,
    name: church.name,
    tagline: church.tagline ?? null,
    logoUrl: church.logoUrl ?? null,
    primaryColor: church.primaryColor ?? DEFAULT_BRANDING.primaryColor,
    secondaryColor: church.secondaryColor ?? DEFAULT_BRANDING.secondaryColor,
    contactEmail: church.contactEmail ?? null,
    features: {
      giving: church.givingEnabled ?? true,
      events: church.eventsEnabled ?? true,
      sermons: church.sermonsEnabled ?? true,
    },
  };
}
