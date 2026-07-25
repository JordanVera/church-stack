import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';

function formatEventWhen(startsAt: Date | string, endsAt?: Date | string | null) {
  const start = new Date(startsAt);
  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (!endsAt) return `${dateLabel} · ${startTime}`;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateLabel} · ${startTime} – ${endTime}`;
}

export default function EventsScreen() {
  const { branding, theme } = useTenant();
  const { isAuthenticated } = useAuth();
  const eventsEnabled = branding.features.events;

  const events = trpc.events.upcoming.useQuery(undefined, {
    enabled: isAuthenticated && eventsEnabled,
  });

  if (!eventsEnabled) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
        <Text className="text-center text-base leading-6" style={{ color: theme.muted }}>
          Events aren't available for this church.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <FlatList
        data={events.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshing={events.isRefetching && !events.isLoading}
        onRefresh={() => void events.refetch()}
        ListEmptyComponent={
          events.isLoading ? (
            <View className="flex-1 items-center justify-center py-24">
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : events.isError ? (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-center text-base leading-6" style={{ color: theme.muted }}>
                Couldn't load events. Pull to refresh or try again later.
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-center text-base leading-6" style={{ color: theme.muted }}>
                No upcoming events.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            className="rounded-[14px] border p-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text className="text-base font-semibold" style={{ color: theme.text }}>
              {item.title}
            </Text>
            <Text className="mt-1.5 text-sm leading-5" style={{ color: theme.muted }}>
              {formatEventWhen(item.startsAt, item.endsAt)}
              {item.location ? ` · ${item.location}` : ''}
            </Text>
            {item.description ? (
              <Text className="mt-2 text-sm leading-5" style={{ color: theme.muted }} numberOfLines={4}>
                {item.description}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}
