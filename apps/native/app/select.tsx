import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../src/lib/trpc';
import { useTenant } from '../src/providers/TenantProvider';

export default function SelectChurch() {
  const router = useRouter();
  const { setTenant } = useTenant();
  const churches = trpc.church.list.useQuery();

  const onSelect = (slug: string) => {
    setTenant(slug);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Find your church</Text>
      <Text style={styles.subtitle}>Select your church to personalize the app.</Text>

      {churches.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a8bbd" />
      ) : churches.error ? (
        <Text style={styles.error}>
          Could not load churches. Is the API running at the configured URL?
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 24, width: '100%' }}
          data={churches.data ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onSelect(item.slug)}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.tagline ? <Text style={styles.cardSubtitle}>{item.tagline}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.subtitle}>No churches found yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6e8ea', paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#22181c' },
  subtitle: { marginTop: 6, fontSize: 15, color: '#787272' },
  error: { marginTop: 24, color: '#dc2626' },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#c7bcbd',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#22181c' },
  cardSubtitle: { marginTop: 4, fontSize: 14, color: '#787272' },
});
