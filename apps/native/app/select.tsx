import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a8bbd" />
      </SafeAreaView>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {hasMemberships ? 'Your churches' : 'Find your church'}
          </Text>
          <Text style={styles.subtitle}>
            {hasMemberships
              ? 'Select a church to continue.'
              : 'Select your church to connect your account.'}
          </Text>
        </View>
        <TouchableOpacity onPress={onSignOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!hasMemberships && churches.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a8bbd" />
      ) : !hasMemberships && churches.error ? (
        <Text style={styles.error}>
          Could not load churches. Is the API running at the configured URL?
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 24, width: '100%' }}
          data={list}
          keyExtractor={(item) => item.id ?? item.slug}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelect(item.slug)}
              disabled={joiningSlug !== null}
            >
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.tagline ? <Text style={styles.cardSubtitle}>{item.tagline}</Text> : null}
                </View>
                {joiningSlug === item.slug ? (
                  <ActivityIndicator color="#1a8bbd" />
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.subtitle}>
              {hasMemberships ? 'No churches on this account.' : 'No churches found yet.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6e8ea', paddingHorizontal: 24, paddingTop: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#22181c' },
  subtitle: { marginTop: 6, fontSize: 15, color: '#787272' },
  signOut: { marginTop: 6, fontSize: 14, color: '#1a8bbd', fontWeight: '600' },
  error: { marginTop: 16, color: '#dc2626' },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#c7bcbd',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#22181c' },
  cardSubtitle: { marginTop: 4, fontSize: 14, color: '#787272' },
});
