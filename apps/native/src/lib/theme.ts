import type { TenantBranding } from '@repo/config';

export interface Theme {
  primary: string;
  primaryForeground: string;
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
    // Match web dark primary-foreground on brand surfaces.
    primaryForeground: '#22181c',
    secondary: branding.secondaryColor,
    // Neutral chrome uses web dark ink scale; church brand colors stay dynamic.
    background: '#22181c',
    card: '#312f2f',
    text: '#f6e8ea',
    muted: '#aba2a3',
    border: 'rgba(255,255,255,0.1)',
  };
}
