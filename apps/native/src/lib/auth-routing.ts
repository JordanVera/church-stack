import type { Router } from 'expo-router';
import { DEFAULT_TENANT } from './config';

export type MembershipChurch = {
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
};

export type MembershipRow = {
  role: string;
  church: MembershipChurch;
};

/**
 * After sign-in / bootstrap: route by membership count.
 * Whitelabel DEFAULT_TENANT: only used when the user has no memberships yet
 * (caller should join that slug); memberships always win.
 */
export function routeAfterAuth(opts: {
  router: Pick<Router, 'replace'>;
  memberships: MembershipRow[] | undefined | null;
  setTenant: (slug: string) => void;
  /** When true, leave navigation to the caller (e.g. already on /select). */
  stayOnSelect?: boolean;
}): 'home' | 'select' | 'join-default' {
  const list = opts.memberships ?? [];

  if (list.length === 1) {
    opts.setTenant(list[0]!.church.slug);
    opts.router.replace('/');
    return 'home';
  }

  if (list.length > 1) {
    if (!opts.stayOnSelect) opts.router.replace('/select');
    return 'select';
  }

  // No memberships
  if (DEFAULT_TENANT) {
    return 'join-default';
  }

  if (!opts.stayOnSelect) opts.router.replace('/select');
  return 'select';
}
