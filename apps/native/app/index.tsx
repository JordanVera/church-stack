import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../src/lib/trpc';
import { useTenant } from '../src/providers/TenantProvider';

export default function Home() {
  const { slug, branding, theme, isLoading, clearTenant } = useTenant();

  // No tenant resolved yet -> send the user to the church picker.
  if (!slug) {
    return <Redirect href="/select" />;
  }

  const announcements = trpc.announcements.list.useQuery();
  const events = trpc.events.upcoming.useQuery();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerName}>{branding.name}</Text>
        {branding.tagline ? <Text style={styles.headerTagline}>{branding.tagline}</Text> : null}
        <TouchableOpacity onPress={clearTenant}>
          <Text style={styles.switch}>Switch church</Text>
        </TouchableOpacity>
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
  headerName: { color: '#ffffff', fontSize: 26, fontWeight: '700' },
  headerTagline: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 15 },
  switch: { color: '#ffffff', marginTop: 14, fontSize: 13, textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardBody: { marginTop: 6, fontSize: 14, lineHeight: 20 },
});
