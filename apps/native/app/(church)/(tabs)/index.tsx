import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HomeHero } from '../../../src/components/HomeHero';
import { trpc } from '../../../src/lib/trpc';
import { usePublicSite } from '../../../src/hooks/usePublicSite';
import { DAY_LABELS, formatServiceTime } from '../../../src/lib/format';
import { useAuth } from '../../../src/providers/AuthProvider';
import { useTenant } from '../../../src/providers/TenantProvider';

function nextServiceLabel(
  locations: {
    name: string;
    services: { dayOfWeek: number; name: string; startTime: string }[];
  }[]
) {
  const today = new Date().getDay();
  const candidates: { dayOffset: number; label: string }[] = [];
  for (const loc of locations) {
    for (const service of loc.services ?? []) {
      const offset = (service.dayOfWeek - today + 7) % 7;
      candidates.push({
        dayOffset: offset,
        label: `${DAY_LABELS[service.dayOfWeek]} · ${service.name} · ${formatServiceTime(service.startTime)}${
          locations.length > 1 ? ` · ${loc.name}` : ''
        }`,
      });
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.dayOffset - b.dayOffset);
  return candidates[0]!.label;
}

export default function Home() {
  const router = useRouter();
  const { branding, theme } = useTenant();
  const { isAuthenticated } = useAuth();
  const site = usePublicSite();
  const announcements = trpc.announcements.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const events = trpc.events.upcoming.useQuery(undefined, { enabled: isAuthenticated });

  const nextService = nextServiceLabel(site.data?.locations ?? []);
  const latestAnnounce = announcements.data?.[0];
  const rsvpEvents = (events.data ?? [])
    .filter((e) => e.requiresRegistration && !e.isRegistered)
    .slice(0, 2);
  const upcomingPreview = (events.data ?? []).slice(0, 3);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-10">
        <HomeHero
          churchName={branding.name}
          tagline={branding.tagline}
          nextService={nextService}
          primaryColor={theme.primary}
          onPressNextService={() => router.push('/more/visit?from=home')}
        />

        <View className="flex-row gap-2 px-5 pt-5">
          {(
            [
              { label: 'Visit', href: '/more/visit?from=home', icon: 'map-outline' as const },
              { label: 'Groups', href: '/more/groups?from=home', icon: 'people-outline' as const },
              { label: 'Give', href: '/give', icon: 'heart-outline' as const },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              className="flex-1 items-center rounded-2xl border border-border bg-card px-2 py-3"
            >
              <Ionicons name={item.icon} size={20} color={theme.primary} />
              <Text className="mt-1 text-xs font-semibold text-foreground">{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-7 px-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">Announcements</Text>
          </View>
          {announcements.isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : latestAnnounce ? (
            <Pressable
              onPress={() => router.push(`/announcement/${latestAnnounce.id}`)}
              className="rounded-[14px] border border-border bg-card p-4"
            >
              <Text className="text-base font-semibold text-foreground">{latestAnnounce.title}</Text>
              <Text className="mt-1.5 text-sm leading-5 text-muted-foreground" numberOfLines={3}>
                {latestAnnounce.body}
              </Text>
              <Text className="mt-2 text-xs font-semibold" style={{ color: theme.primary }}>
                Read more
              </Text>
            </Pressable>
          ) : (
            <Text className="text-muted-foreground">No announcements yet.</Text>
          )}
          {(announcements.data?.length ?? 0) > 1 ? (
            <View className="mt-2.5 gap-2">
              {announcements.data!.slice(1, 4).map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => router.push(`/announcement/${a.id}`)}
                  className="rounded-xl border border-border bg-card px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {a.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {rsvpEvents.length > 0 ? (
          <View className="mt-7 px-5">
            <Text className="mb-3 text-xl font-bold text-foreground">Register soon</Text>
            {rsvpEvents.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => router.push('/events')}
                className="mb-2.5 rounded-[14px] border border-border bg-card p-4"
              >
                <Text className="text-base font-semibold text-foreground">{e.title}</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {new Date(e.startsAt).toLocaleString()}
                </Text>
                <Text className="mt-2 text-xs font-semibold" style={{ color: theme.primary }}>
                  Register on Events
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="mt-7 px-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">Upcoming events</Text>
            <Pressable onPress={() => router.push('/events')}>
              <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                See all
              </Text>
            </Pressable>
          </View>
          {events.isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : upcomingPreview.length ? (
            upcomingPreview.map((e) => (
              <View
                key={e.id}
                className="mb-2.5 rounded-[14px] border border-border bg-card p-4"
              >
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
        </View>
      </ScrollView>
    </View>
  );
}
