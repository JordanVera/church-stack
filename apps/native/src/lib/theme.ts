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
  mode: 'light' | 'dark';
}

const LIGHT_CHROME = {
  background: '#f6e8ea',
  card: '#ffffff',
  text: '#22181c',
  muted: '#787272',
  border: '#c7bcbd',
  primaryForeground: '#ffffff',
} as const;

const DARK_CHROME = {
  background: '#22181c',
  card: '#312f2f',
  text: '#f6e8ea',
  muted: '#aba2a3',
  border: 'rgba(255,255,255,0.1)',
  primaryForeground: '#22181c',
} as const;

/** Brand colors + mode-aware chrome (for RN APIs that need hex: icons, tab bar). */
export function themeFromBranding(
  branding: TenantBranding,
  mode: 'light' | 'dark' = 'dark'
): Theme {
  const chrome = mode === 'light' ? LIGHT_CHROME : DARK_CHROME;
  return {
    primary: branding.primaryColor,
    secondary: branding.secondaryColor,
    mode,
    ...chrome,
  };
}
