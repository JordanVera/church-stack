import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { trpc } from '../../../../src/lib/trpc';
import { useTenant } from '../../../../src/providers/TenantProvider';

export default function RegistrationsScreen() {
  const router = useRouter();
  const { theme } = useTenant();
  const events = trpc.events.upcoming.useQuery();
  const registered = (events.data ?? []).filter((e) => e.isRegistered);

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="My registrations" />
      {events.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : registered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            You haven’t registered for any upcoming events.
          </Text>
          <Pressable
            onPress={() => router.push('/events')}
            className="mt-4 rounded-xl px-5 py-3"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-sm font-bold" style={{ color: theme.primaryForeground }}>
              Browse events
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-5 pb-10">
          {registered.map((event) => (
            <View key={event.id} className="rounded-2xl border border-border bg-card p-4">
              <Text className="text-base font-bold text-foreground">{event.title}</Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                {new Date(event.startsAt).toLocaleString()}
                {event.location ? ` · ${event.location}` : ''}
              </Text>
              {event.description ? (
                <Text className="mt-2 text-sm leading-5 text-muted-foreground" numberOfLines={3}>
                  {event.description}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
