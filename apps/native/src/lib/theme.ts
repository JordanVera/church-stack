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
    // Coral/mint brand colors are light enough that white text reads poorly on
    // them, so default to a dark ink foreground instead.
    primaryForeground: '#22181c',
    secondary: branding.secondaryColor,
    background: '#f6e8ea',
    card: '#ffffff',
    text: '#22181c',
    muted: '#787272',
    border: '#c7bcbd',
  };
}
