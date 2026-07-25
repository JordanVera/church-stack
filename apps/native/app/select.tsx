import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../src/lib/trpc';
import { useAuth } from '../src/providers/AuthProvider';
import { useTenant } from '../src/providers/TenantProvider';
import { cn } from '../src/lib/cn';
import { LinearGradient, SafeAreaView } from '../src/components/uniwind';

type ChurchRow = {
  id?: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export default function SelectChurch() {
  const router = useRouter();
  const { setTenant } = useTenant();
  const { isReady, token, isAuthenticated, meLoading, memberships, signOut, refreshMe } = useAuth();
  const churches = trpc.church.list.useQuery(undefined, {
    enabled: isAuthenticated && (memberships?.length ?? 0) === 0,
  });
  const join = trpc.church.join.useMutation();
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const hasMemberships = (memberships?.length ?? 0) > 0;
  const list: ChurchRow[] = useMemo(
    () =>
      hasMemberships
        ? (memberships ?? []).map((m) => ({
            id: m.church.slug,
            slug: m.church.slug,
            name: m.church.name,
            tagline: null,
            logoUrl: null,
          }))
        : (churches.data ?? []),
    [hasMemberships, memberships, churches.data]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = c.name.toLowerCase();
      const tagline = (c.tagline ?? '').toLowerCase();
      return name.includes(q) || tagline.includes(q);
    });
  }, [list, query]);

  // Pad odd counts so every row stays two equal cells (empty slot on the right).
  const gridData = useMemo<(ChurchRow | null)[]>(() => {
    if (filtered.length === 0) return [];
    return filtered.length % 2 === 1 ? [...filtered, null] : filtered;
  }, [filtered]);

  if (!isReady || meLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#55bae8" />
      </View>
    );
  }

  if (!token || !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const onSelect = async (slug: string) => {
    setError(null);
    if (hasMemberships) {
      setTenant(slug);
      router.replace('/');
      return;
    }

    setJoiningSlug(slug);
    try {
      const church = await join.mutateAsync({ slug });
      await refreshMe();
      setTenant(church.slug);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join church.');
    } finally {
      setJoiningSlug(null);
    }
  };

  const onSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const emptyMessage = query.trim()
    ? 'No churches match your search.'
    : hasMemberships
      ? 'No churches on this account.'
      : 'No churches found yet.';

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#051c26', '#22181c', '#312f2f']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-3 pb-2">
          <View className="mb-[18px] flex-row items-center justify-between">
            <Text className="text-[15px] font-bold tracking-tight text-brand-400">
              Church Stack
            </Text>
            <TouchableOpacity onPress={onSignOut} hitSlop={12}>
              <Text className="text-sm font-semibold text-brand-300">Sign out</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-[32px] font-bold tracking-tight text-foreground">
            {hasMemberships ? 'Your churches' : 'Find your church'}
          </Text>
          <Text className="mt-2 max-w-[340px] text-base leading-[22px] text-muted-foreground">
            {hasMemberships
              ? 'Choose where you want to continue.'
              : 'Connect your account to the church you call home.'}
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search churches"
            placeholderTextColor="rgba(246,232,234,0.45)"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            className="mt-5 rounded-[14px] border border-input bg-white/10 px-3.5 py-3 text-base text-foreground"
          />
        </View>

        {error ? <Text className="mx-6 mt-3 text-sm text-destructive">{error}</Text> : null}

        {!hasMemberships && churches.isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#55bae8" />
        ) : !hasMemberships && churches.error ? (
          <Text className="mx-6 mt-3 text-sm text-destructive">
            Could not load churches. Is the API running at the configured URL?
          </Text>
        ) : (
          <FlatList
            className="mt-2 flex-1"
            contentContainerClassName="px-5 pb-7 pt-2"
            data={gridData}
            keyExtractor={(item, index) => item?.id ?? item?.slug ?? `empty-${index}`}
            numColumns={2}
            columnWrapperClassName="gap-3"
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => {
              if (!item) {
                return <View className="aspect-square flex-1" />;
              }

              const busy = joiningSlug === item.slug;
              return (
                <Pressable
                  onPress={() => onSelect(item.slug)}
                  disabled={joiningSlug !== null}
                  className={cn(
                    'aspect-square flex-1 items-center justify-center rounded-2xl border border-border bg-card px-3',
                    joiningSlug !== null && !busy && 'opacity-55'
                  )}
                  style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
                >
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-brand-900">
                    {busy ? (
                      <ActivityIndicator color="#55bae8" />
                    ) : (
                      <Text className="text-lg font-bold text-brand-300">
                        {initials(item.name)}
                      </Text>
                    )}
                  </View>
                  <Text
                    className="text-center text-[15px] font-semibold text-foreground"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.tagline ? (
                    <Text
                      className="mt-1 text-center text-[12px] text-muted-foreground"
                      numberOfLines={2}
                    >
                      {item.tagline}
                    </Text>
                  ) : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text className="mt-6 text-center text-[15px] text-muted-foreground">
                {emptyMessage}
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
