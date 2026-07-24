import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { trpc } from '../lib/trpc';
import { DEFAULT_TENANT } from '../lib/config';
import { routeAfterAuth } from '../lib/auth-routing';
import { useAuth } from '../providers/AuthProvider';
import { useTenant } from '../providers/TenantProvider';

const AUTH_SCREENS = new Set(['login', 'signup']);

/**
 * Global auth + membership routing. Renders nothing; redirects as needed.
 */
export function AuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady, token, isAuthenticated, meLoading, memberships, refreshMe } = useAuth();
  const { slug, setTenant } = useTenant();
  const joinMutation = trpc.church.join.useMutation();
  const joiningRef = useRef(false);

  const top = segments[0] as string | undefined;
  const onAuthScreen = !!top && AUTH_SCREENS.has(top);

  useEffect(() => {
    if (!isReady) return;

    if (!token) {
      if (!onAuthScreen) router.replace('/login');
      return;
    }

    if (meLoading || !isAuthenticated) return;

    if (onAuthScreen || !slug) {
      const result = routeAfterAuth({
        router,
        memberships,
        setTenant,
        stayOnSelect: top === 'select',
      });

      if (result === 'join-default' && DEFAULT_TENANT && !joiningRef.current) {
        joiningRef.current = true;
        void joinMutation
          .mutateAsync({ slug: DEFAULT_TENANT })
          .then(async (church) => {
            await refreshMe();
            setTenant(church.slug);
            router.replace('/');
          })
          .catch(() => {
            joiningRef.current = false;
            router.replace('/select');
          });
      }
    }
  }, [
    isReady,
    token,
    meLoading,
    isAuthenticated,
    memberships,
    slug,
    onAuthScreen,
    top,
    router,
    setTenant,
    joinMutation,
    refreshMe,
  ]);

  return null;
}
