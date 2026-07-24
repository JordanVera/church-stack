import React, { createContext, useContext, useMemo, useState } from 'react';
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
  // Tenant is set after auth (membership or join). Whitelabel DEFAULT_TENANT
  // is applied by the auth gate via church.join, not on mount.
  const [slug, setSlug] = useState<string | null>(() => tenantStore.get());

  const brandingQuery = trpc.church.getBranding.useQuery(
    { slug: slug ?? '' },
    { enabled: !!slug }
  );

  const value = useMemo<TenantContextValue>(() => {
    const branding = brandingQuery.data ?? DEFAULT_BRANDING;
    return {
      slug,
      branding,
      theme: themeFromBranding(branding),
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
  }, [slug, brandingQuery.data, brandingQuery.isLoading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider');
  return ctx;
}

export function useTheme() {
  return useTenant().theme;
}
