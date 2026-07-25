import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenHeader } from '../../../src/components/StackScreenHeader';
import { usePublicSite } from '../../../src/hooks/usePublicSite';
import { useTenant } from '../../../src/providers/TenantProvider';

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
}

export default function PastorsScreen() {
  const { theme } = useTenant();
  const site = usePublicSite();
  const pastors = site.data?.pastors ?? [];

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Leadership" />
      {site.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : pastors.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            No leadership listed yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-5 pb-10">
          {pastors.map((pastor) => {
            const name = `${pastor.firstName} ${pastor.lastName}`.trim();
            return (
              <View key={pastor.id} className="flex-row gap-3 rounded-2xl border border-border bg-card p-4">
                {pastor.photoUrl ? (
                  <Image
                    source={{ uri: pastor.photoUrl }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      backgroundColor: theme.border,
                    }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    className="h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Text className="text-lg font-bold" style={{ color: theme.primaryForeground }}>
                      {initials(pastor.firstName, pastor.lastName)}
                    </Text>
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-bold text-foreground">{name}</Text>
                  <Text className="mt-0.5 text-sm text-muted-foreground">{pastor.title}</Text>
                  <View className="mt-2 flex-row gap-3">
                    {pastor.facebookUrl ? (
                      <Pressable onPress={() => void Linking.openURL(pastor.facebookUrl!)}>
                        <Ionicons name="logo-facebook" size={18} color={theme.muted} />
                      </Pressable>
                    ) : null}
                    {pastor.instagramUrl ? (
                      <Pressable onPress={() => void Linking.openURL(pastor.instagramUrl!)}>
                        <Ionicons name="logo-instagram" size={18} color={theme.muted} />
                      </Pressable>
                    ) : null}
                    {pastor.youtubeUrl ? (
                      <Pressable onPress={() => void Linking.openURL(pastor.youtubeUrl!)}>
                        <Ionicons name="logo-youtube" size={18} color={theme.muted} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
