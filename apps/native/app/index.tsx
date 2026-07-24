import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../src/lib/trpc';
import { useAuth } from '../src/providers/AuthProvider';
import { useTenant } from '../src/providers/TenantProvider';

export default function Home() {
  const router = useRouter();
  const { slug, branding, theme, isLoading, clearTenant } = useTenant();
  const { isReady, token, isAuthenticated, meLoading, memberships, signOut } = useAuth();

  const feedEnabled = !!slug && isAuthenticated;
  const announcements = trpc.announcements.list.useQuery(undefined, { enabled: feedEnabled });
  const events = trpc.events.upcoming.useQuery(undefined, { enabled: feedEnabled });

  if (!isReady || meLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerName, { color: theme.primaryForeground }]}>{branding.name}</Text>
        {branding.tagline ? (
          <Text style={[styles.headerTagline, { color: theme.primaryForeground, opacity: 0.85 }]}>
            {branding.tagline}
          </Text>
        ) : null}
        <View style={styles.headerActions}>
          {canSwitchChurch ? (
            <TouchableOpacity onPress={onSwitchChurch}>
              <Text style={[styles.switch, { color: theme.primaryForeground }]}>Switch church</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onSignOut}>
            <Text style={[styles.switch, { color: theme.primaryForeground }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Announcements</Text>
        {announcements.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : announcements.data?.length ? (
          announcements.data.map((a) => (
            <View key={a.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{a.title}</Text>
              <Text style={[styles.cardBody, { color: theme.muted }]}>{a.body}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>No announcements yet.</Text>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 28 }]}>
          Upcoming events
        </Text>
        {events.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : events.data?.length ? (
          events.data.map((e) => (
            <View key={e.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{e.title}</Text>
              <Text style={[styles.cardBody, { color: theme.muted }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  headerName: { fontSize: 26, fontWeight: '700' },
  headerTagline: { marginTop: 4, fontSize: 15 },
  headerActions: { marginTop: 14, flexDirection: 'row', gap: 16 },
  switch: { fontSize: 13, textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardBody: { marginTop: 6, fontSize: 14, lineHeight: 20 },
});
