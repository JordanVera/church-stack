import type { TenantBranding } from '@repo/config';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
}

export function themeFromBranding(branding: TenantBranding): Theme {
  return {
    primary: branding.primaryColor,
    secondary: branding.secondaryColor,
    background: '#ffffff',
    card: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
  };
}
