import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../src/lib/trpc';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';
import type { Theme } from '../../src/lib/theme';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date | string;
  endsAt: Date | string | null;
  requiresRegistration: boolean;
  isRegistered: boolean;
};

function formatTimeRange(startsAt: Date | string, endsAt?: Date | string | null) {
  const start = new Date(startsAt);
  const startTime = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (!endsAt) return startTime;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${startTime} – ${endTime}`;
}

function EventCard({
  event,
  theme,
  busy,
  error,
  onRegister,
  onCancel,
}: {
  event: EventRow;
  theme: Theme;
  busy: boolean;
  error: string | null;
  onRegister: () => void;
  onCancel: () => void;
}) {
  const start = new Date(event.startsAt);
  const day = start.toLocaleDateString(undefined, { day: 'numeric' });
  const month = start.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const weekday = start.toLocaleDateString(undefined, { weekday: 'short' });

  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <View className="flex-row">
        <View
          className="w-[72px] items-center justify-center px-2 py-4"
          style={{ backgroundColor: theme.primary }}
        >
          <Text
            className="text-[11px] font-bold tracking-widest"
            style={{ color: theme.primaryForeground, opacity: 0.85 }}
          >
            {month}
          </Text>
          <Text
            className="mt-0.5 text-[28px] font-bold leading-none"
            style={{ color: theme.primaryForeground }}
          >
            {day}
          </Text>
          <Text
            className="mt-1 text-[11px] font-semibold"
            style={{ color: theme.primaryForeground, opacity: 0.8 }}
          >
            {weekday}
          </Text>
        </View>

        <View className="min-w-0 flex-1 px-4 py-3.5">
          <Text
            className="text-lg font-bold leading-6"
            style={{ color: theme.text }}
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <View className="mt-2.5 gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={14} color={theme.muted} />
              <Text className="text-sm" style={{ color: theme.muted }}>
                {formatTimeRange(event.startsAt, event.endsAt)}
              </Text>
            </View>
            {event.location ? (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="location-outline" size={14} color={theme.muted} />
                <Text className="flex-1 text-sm" style={{ color: theme.muted }} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            ) : null}
          </View>

          {event.description ? (
            <Text
              className="mt-2.5 text-sm leading-5"
              style={{ color: theme.muted }}
              numberOfLines={3}
            >
              {event.description}
            </Text>
          ) : null}

          {event.requiresRegistration ? (
            <View className="mt-3.5">
              {event.isRegistered ? (
                <View className="gap-2">
                  <View
                    className="flex-row items-center justify-center gap-1.5 rounded-xl px-4 py-2.5"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Registered
                    </Text>
                  </View>
                  <Pressable
                    onPress={onCancel}
                    disabled={busy}
                    className="items-center py-1"
                    style={{ opacity: busy ? 0.5 : 1 }}
                  >
                    <Text className="text-sm font-medium" style={{ color: theme.muted }}>
                      {busy ? 'Canceling…' : 'Cancel registration'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={onRegister}
                  disabled={busy}
                  className="items-center rounded-xl px-4 py-3"
                  style={{ backgroundColor: theme.primary, opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? (
                    <ActivityIndicator color={theme.primaryForeground} />
                  ) : (
                    <Text className="text-sm font-bold" style={{ color: theme.primaryForeground }}>
                      Register
                    </Text>
                  )}
                </Pressable>
              )}
              {error ? (
                <Text className="mt-2 text-center text-xs" style={{ color: '#f87171' }}>
                  {error}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function EventsScreen() {
  const { branding, theme } = useTenant();
  const { isAuthenticated } = useAuth();
  const eventsEnabled = branding.features.events;
  const utils = trpc.useUtils();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const events = trpc.events.upcoming.useQuery(undefined, {
    enabled: isAuthenticated && eventsEnabled,
  });

  const register = trpc.events.register.useMutation({
    onSuccess: async () => {
      await utils.events.upcoming.invalidate();
    },
  });

  const cancel = trpc.events.cancelRegistration.useMutation({
    onSuccess: async () => {
      await utils.events.upcoming.invalidate();
    },
  });

  const onRegister = async (eventId: string) => {
    setBusyId(eventId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    try {
      await register.mutateAsync({ eventId });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [eventId]: err instanceof Error ? err.message : 'Could not register',
      }));
    } finally {
      setBusyId(null);
    }
  };

  const onCancel = async (eventId: string) => {
    setBusyId(eventId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    try {
      await cancel.mutateAsync({ eventId });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [eventId]: err instanceof Error ? err.message : 'Could not cancel',
      }));
    } finally {
      setBusyId(null);
    }
  };

  if (!eventsEnabled) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.background }}
      >
        <Text className="text-center text-base leading-6" style={{ color: theme.muted }}>
          Events aren't available for this church.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <FlatList
        data={(events.data ?? []) as EventRow[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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
          <EventCard
            event={item}
            theme={theme}
            busy={busyId === item.id}
            error={errors[item.id] ?? null}
            onRegister={() => void onRegister(item.id)}
            onCancel={() => void onCancel(item.id)}
          />
        )}
      />
    </View>
  );
}
