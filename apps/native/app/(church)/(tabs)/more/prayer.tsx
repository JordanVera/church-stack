import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { trpc } from '../../../../src/lib/trpc';
import { useTenant } from '../../../../src/providers/TenantProvider';

export default function PrayerScreen() {
  const { theme } = useTenant();
  const [body, setBody] = useState('');
  const utils = trpc.useUtils();
  const mine = trpc.engagement.myPrayerRequests.useQuery();

  const submit = trpc.engagement.submitPrayerRequest.useMutation({
    onSuccess: async () => {
      setBody('');
      await utils.engagement.myPrayerRequests.invalidate();
      Alert.alert('Submitted', 'Your prayer request was shared with the church team.');
    },
    onError: (e) => Alert.alert('Could not submit', e.message),
  });

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Prayer" />
      <ScrollView contentContainerClassName="gap-5 p-5 pb-12" keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-sm font-medium text-muted-foreground">Share a request</Text>
          <TextInput
            className="mt-1 min-h-[120px] rounded-xl border border-border bg-card px-3.5 py-3 text-base text-foreground"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            placeholder="How can we pray for you?"
            placeholderTextColor={theme.muted}
          />
          <Pressable
            onPress={() => submit.mutate({ body: body.trim() })}
            disabled={submit.isPending || !body.trim()}
            className="mt-3 items-center rounded-xl px-4 py-3.5"
            style={{ backgroundColor: theme.primary, opacity: submit.isPending ? 0.6 : 1 }}
          >
            {submit.isPending ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <Text className="text-sm font-bold" style={{ color: theme.primaryForeground }}>
                Submit request
              </Text>
            )}
          </Pressable>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your recent requests
          </Text>
          {mine.isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : mine.data?.length ? (
            <View className="gap-2.5">
              {mine.data.map((row) => (
                <View key={row.id} className="rounded-2xl border border-border bg-card p-4">
                  <Text className="text-sm leading-5 text-foreground">{row.body}</Text>
                  <Text className="mt-2 text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()} · {row.status.toLowerCase()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">No requests yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
