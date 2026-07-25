import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Uniwind, useUniwind } from 'uniwind';
import { DEFAULT_BRANDING, type TenantBranding } from '@repo/config';
import { trpc } from '../lib/trpc';
import { tenantStore } from '../lib/tenant-store';
import { themeFromBranding, type Theme } from '../lib/theme';

interface TenantContextValue {
  slug: string | null;
  branding: TenantBranding;
  theme: Theme;
  isLoading: boolean;
  setTenant: (slug: string) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { theme: mode } = useUniwind();
  const resolvedMode = mode === 'dark' ? 'dark' : 'light';
  // Tenant is set after auth (membership or join). Whitelabel DEFAULT_TENANT
  // is applied by the auth gate via church.join, not on mount.
  const [slug, setSlug] = useState<string | null>(() => tenantStore.get());

  const brandingQuery = trpc.church.getBranding.useQuery(
    { slug: slug ?? '' },
    { enabled: !!slug }
  );

  useEffect(() => {
    const branding = brandingQuery.data;
    if (!branding) return;
    const vars = {
      '--color-primary': branding.primaryColor,
    };
    Uniwind.updateCSSVariables('light', {
      ...vars,
      '--color-primary-foreground': '#ffffff',
    });
    Uniwind.updateCSSVariables('dark', {
      ...vars,
      '--color-primary-foreground': '#22181c',
    });
  }, [brandingQuery.data]);

  const value = useMemo<TenantContextValue>(() => {
    const branding = brandingQuery.data ?? DEFAULT_BRANDING;
    return {
      slug,
      branding,
      theme: themeFromBranding(branding, resolvedMode),
      isLoading: !!slug && brandingQuery.isLoading,
      setTenant: (next: string) => {
        tenantStore.set(next);
        setSlug(next);
      },
      clearTenant: () => {
        tenantStore.set(null);
        setSlug(null);
      },
    };
  }, [slug, brandingQuery.data, brandingQuery.isLoading, resolvedMode]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider');
  return ctx;
}

/** Branding + mode-aware chrome colors (not Uniwind's useUniwind). */
export function useBrandingTheme() {
  return useTenant().theme;
}
