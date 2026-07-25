import { ActivityIndicator, Share, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenHeader } from '../../../src/components/StackScreenHeader';
import { trpc } from '../../../src/lib/trpc';
import { useTenant } from '../../../src/providers/TenantProvider';

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, branding } = useTenant();
  const query = trpc.announcements.byId.useQuery(
    { id: id ?? '' },
    { enabled: !!id }
  );

  const onShare = async () => {
    if (!query.data) return;
    await Share.share({
      message: `${query.data.title}\n\n${query.data.body}\n\n— ${branding.name}`,
    });
  };

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Announcement" fallbackHref="/" preferHistory />
      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : !query.data ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            Announcement not found.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-5 pb-12">
          <Text className="text-[26px] font-bold tracking-tight text-foreground">
            {query.data.title}
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            {new Date(query.data.createdAt).toLocaleString()}
          </Text>
          <Text className="mt-5 text-base leading-7 text-foreground">{query.data.body}</Text>
          <Pressable
            onPress={() => void onShare()}
            className="mt-8 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <Ionicons name="share-outline" size={18} color={theme.text} />
            <Text className="text-sm font-semibold text-foreground">Share</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
