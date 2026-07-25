import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { trpc } from '../lib/trpc';
import { useAuth } from '../providers/AuthProvider';
import { useTenant } from '../providers/TenantProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Registers Expo push token with the API when signed in. */
export function PushRegistration() {
  const { isAuthenticated, isReady } = useAuth();
  const { slug } = useTenant();
  const register = trpc.engagement.registerDeviceToken.useMutation();

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;

    let cancelled = false;
    void (async () => {
      try {
        const permissions = await Notifications.getPermissionsAsync();
        let status = permissions.status;
        if (status !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          status = requested.status;
        }
        if (status !== 'granted' || cancelled) return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        if (cancelled || !tokenResponse.data) return;

        await register.mutateAsync({
          token: tokenResponse.data,
          platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown',
        });
      } catch (err) {
        console.warn(
          '[push] registration skipped:',
          err instanceof Error ? err.message : err
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-register when church changes so token is scoped.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutateAsync identity is unstable
  }, [isReady, isAuthenticated, slug]);

  return null;
}
