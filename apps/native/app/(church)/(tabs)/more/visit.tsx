import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { usePublicSite } from '../../../../src/hooks/usePublicSite';
import { DAY_LABELS, formatServiceTime } from '../../../../src/lib/format';
import { useTenant } from '../../../../src/providers/TenantProvider';

function openMaps(address: string) {
  const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  void Linking.openURL(url);
}

export default function VisitScreen() {
  const { theme } = useTenant();
  const site = usePublicSite();
  const locations = site.data?.locations ?? [];

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Visit" />
      {site.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : locations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            No campuses listed yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-5 pb-10">
          {locations.map((loc) => (
            <View key={loc.id} className="rounded-2xl border border-border bg-card p-4">
              <Text className="text-lg font-bold text-foreground">{loc.name}</Text>
              {loc.address ? (
                <Pressable
                  onPress={() => openMaps(loc.address)}
                  className="mt-2 flex-row items-start gap-1.5"
                >
                  <Ionicons name="location-outline" size={16} color={theme.primary} />
                  <Text className="flex-1 text-sm leading-5" style={{ color: theme.primary }}>
                    {loc.address}
                  </Text>
                </Pressable>
              ) : null}

              {loc.services?.length ? (
                <View className="mt-4 gap-2 border-t border-border pt-3">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Service times
                  </Text>
                  {loc.services.map((service) => (
                    <View key={service.id} className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-foreground">
                        {DAY_LABELS[service.dayOfWeek] ?? 'Weekly'} · {service.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {formatServiceTime(service.startTime)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="mt-3 text-sm text-muted-foreground">No service times listed.</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
