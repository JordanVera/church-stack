import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';

export default function Home() {
  const { theme } = useTenant();
  const { isAuthenticated } = useAuth();

  const feedEnabled = isAuthenticated;
  const announcements = trpc.announcements.list.useQuery(undefined, { enabled: feedEnabled });
  const events = trpc.events.upcoming.useQuery(undefined, { enabled: feedEnabled });

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-5">
        <Text className="mb-3 text-xl font-bold text-foreground">Announcements</Text>
        {announcements.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : announcements.data?.length ? (
          announcements.data.map((a) => (
            <View key={a.id} className="mb-3 rounded-[14px] border border-border bg-card p-4">
              <Text className="text-base font-semibold text-foreground">{a.title}</Text>
              <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">{a.body}</Text>
            </View>
          ))
        ) : (
          <Text className="text-muted-foreground">No announcements yet.</Text>
        )}

        <Text className="mb-3 mt-7 text-xl font-bold text-foreground">Upcoming events</Text>
        {events.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : events.data?.length ? (
          events.data.map((e) => (
            <View key={e.id} className="mb-3 rounded-[14px] border border-border bg-card p-4">
              <Text className="text-base font-semibold text-foreground">{e.title}</Text>
              <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">
                {new Date(e.startsAt).toLocaleString()}
                {e.location ? ` · ${e.location}` : ''}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-muted-foreground">No upcoming events.</Text>
        )}
      </ScrollView>
    </View>
  );
}
