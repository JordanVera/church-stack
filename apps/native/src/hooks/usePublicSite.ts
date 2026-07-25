import { trpc } from '../lib/trpc';
import { useTenant } from '../providers/TenantProvider';

/** Cached public church payload for More / Home discovery surfaces. */
export function usePublicSite() {
  const { slug } = useTenant();
  return trpc.church.getPublicSite.useQuery({ slug: slug ?? '' }, { enabled: !!slug });
}
