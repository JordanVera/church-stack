import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { trpc } from '../src/lib/trpc';
import { useAuth } from '../src/providers/AuthProvider';
import { useTenant } from '../src/providers/TenantProvider';

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
  const { isReady, token, isAuthenticated, meLoading, memberships, signOut, refreshMe } =
    useAuth();
  const churches = trpc.church.list.useQuery(undefined, {
    enabled: isAuthenticated && (memberships?.length ?? 0) === 0,
  });
  const join = trpc.church.join.useMutation();
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isReady || meLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color="#2aa3d4" />
      </View>
    );
  }

  if (!token || !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const hasMemberships = (memberships?.length ?? 0) > 0;
  const list: ChurchRow[] = hasMemberships
    ? (memberships ?? []).map((m) => ({
        id: m.church.slug,
        slug: m.church.slug,
        name: m.church.name,
        tagline: null,
        logoUrl: null,
      }))
    : (churches.data ?? []);

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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#eef6fa', '#f7f1ee', '#f4f7fa']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.kicker}>Church Stack</Text>
            <TouchableOpacity onPress={onSignOut} hitSlop={12}>
              <Text style={styles.signOut}>Sign out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>
            {hasMemberships ? 'Your churches' : 'Find your church'}
          </Text>
          <Text style={styles.subtitle}>
            {hasMemberships
              ? 'Choose where you want to continue.'
              : 'Connect your account to the church you call home.'}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!hasMemberships && churches.isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#2aa3d4" />
        ) : !hasMemberships && churches.error ? (
          <Text style={styles.error}>
            Could not load churches. Is the API running at the configured URL?
          </Text>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={list}
            keyExtractor={(item) => item.id ?? item.slug}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => {
              const busy = joiningSlug === item.slug;
              return (
                <Pressable
                  onPress={() => onSelect(item.slug)}
                  disabled={joiningSlug !== null}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                    joiningSlug !== null && !busy && styles.rowDimmed,
                  ]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(item.name)}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    {item.tagline ? (
                      <Text style={styles.rowSubtitle} numberOfLines={2}>
                        {item.tagline}
                      </Text>
                    ) : (
                      <Text style={styles.rowSubtitle}>
                        {hasMemberships ? 'Tap to open' : 'Tap to join'}
                      </Text>
                    )}
                  </View>
                  {busy ? (
                    <ActivityIndicator color="#2aa3d4" />
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {hasMemberships ? 'No churches on this account.' : 'No churches found yet.'}
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: '#eef6fa', justifyContent: 'center' },
  root: { flex: 1, backgroundColor: '#eef6fa' },
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: '#1a6f90',
  },
  signOut: { fontSize: 14, fontWeight: '600', color: '#3a7f9a' },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: '#152028',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: '#5c6b75',
    maxWidth: 340,
  },
  error: { marginHorizontal: 24, marginTop: 12, color: '#c23b3b', fontSize: 14 },
  list: { flex: 1, marginTop: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(21,32,40,0.08)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.96)', transform: [{ scale: 0.99 }] },
  rowDimmed: { opacity: 0.55 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#d7ebf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#1a6f90' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 17, fontWeight: '600', color: '#152028' },
  rowSubtitle: { marginTop: 3, fontSize: 13, color: '#6a7882' },
  chevron: { fontSize: 28, lineHeight: 28, color: '#8aa0ad', marginTop: -2 },
  empty: { marginTop: 24, fontSize: 15, color: '#5c6b75', textAlign: 'center' },
});
