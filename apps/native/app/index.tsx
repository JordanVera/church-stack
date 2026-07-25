import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../src/lib/trpc';
import { useAuth } from '../src/providers/AuthProvider';
import { useTenant } from '../src/providers/TenantProvider';
import { SafeAreaView } from '../src/components/uniwind';

export default function Home() {
  const router = useRouter();
  const { slug, branding, theme, isLoading, clearTenant } = useTenant();
  const { isReady, token, isAuthenticated, meLoading, memberships, signOut } = useAuth();

  const feedEnabled = !!slug && isAuthenticated;
  const announcements = trpc.announcements.list.useQuery(undefined, { enabled: feedEnabled });
  const events = trpc.events.upcoming.useQuery(undefined, { enabled: feedEnabled });

  if (!isReady || meLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!token || !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // AuthRedirect / select will assign a tenant; wait here.
  if (!slug || isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const canSwitchChurch = (memberships?.length ?? 0) !== 1;

  const onSwitchChurch = () => {
    clearTenant();
    router.replace('/select');
  };

  const onSignOut = async () => {
    clearTenant();
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <StatusBar style="light" />
      <View className="px-5 pt-6 pb-7" style={{ backgroundColor: theme.primary }}>
        <Text className="text-[26px] font-bold" style={{ color: theme.primaryForeground }}>
          {branding.name}
        </Text>
        {branding.tagline ? (
          <Text
            className="mt-1 text-[15px] opacity-85"
            style={{ color: theme.primaryForeground }}
          >
            {branding.tagline}
          </Text>
        ) : null}
        <View className="mt-3.5 flex-row gap-4">
          {canSwitchChurch ? (
            <TouchableOpacity onPress={onSwitchChurch}>
              <Text
                className="text-[13px] underline"
                style={{ color: theme.primaryForeground }}
              >
                Switch church
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onSignOut}>
            <Text className="text-[13px] underline" style={{ color: theme.primaryForeground }}>
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-5">
        <Text className="mb-3 text-xl font-bold" style={{ color: theme.text }}>
          Announcements
        </Text>
        {announcements.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : announcements.data?.length ? (
          announcements.data.map((a) => (
            <View
              key={a.id}
              className="mb-3 rounded-[14px] border p-4"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.text }}>
                {a.title}
              </Text>
              <Text className="mt-1.5 text-sm leading-5" style={{ color: theme.muted }}>
                {a.body}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>No announcements yet.</Text>
        )}

        <Text className="mb-3 mt-7 text-xl font-bold" style={{ color: theme.text }}>
          Upcoming events
        </Text>
        {events.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : events.data?.length ? (
          events.data.map((e) => (
            <View
              key={e.id}
              className="mb-3 rounded-[14px] border p-4"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.text }}>
                {e.title}
              </Text>
              <Text className="mt-1.5 text-sm leading-5" style={{ color: theme.muted }}>
                {new Date(e.startsAt).toLocaleString()}
                {e.location ? ` · ${e.location}` : ''}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>No upcoming events.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
