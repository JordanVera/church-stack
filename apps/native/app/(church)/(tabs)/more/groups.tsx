import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { usePublicSite } from '../../../../src/hooks/usePublicSite';
import { formatMeetingDay, formatServiceTime } from '../../../../src/lib/format';
import { trpc } from '../../../../src/lib/trpc';
import { useTenant } from '../../../../src/providers/TenantProvider';

export default function GroupsScreen() {
  const { theme } = useTenant();
  const site = usePublicSite();
  const groups = site.data?.lifeGroups ?? [];
  const interests = trpc.engagement.myGroupInterests.useQuery();
  const interestedIds = useMemo(
    () => new Set((interests.data ?? []).map((r) => r.lifeGroupId)),
    [interests.data]
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const express = trpc.engagement.expressGroupInterest.useMutation({
    onSuccess: async () => {
      await utils.engagement.myGroupInterests.invalidate();
    },
    onError: (e) => Alert.alert('Could not send interest', e.message),
  });

  const onInterest = async (lifeGroupId: string) => {
    setBusyId(lifeGroupId);
    try {
      await express.mutateAsync({ lifeGroupId });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Life groups" />
      {site.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            No life groups listed yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-5 pb-10">
          {groups.map((group) => {
            const day = formatMeetingDay(group.meetingDay);
            const time = group.meetingTime ? formatServiceTime(group.meetingTime) : null;
            const meta = [day, time, group.location].filter(Boolean).join(' · ');
            const interested = interestedIds.has(group.id);
            return (
              <View key={group.id} className="rounded-2xl border border-border bg-card p-4">
                <Text className="text-lg font-bold text-foreground">{group.name}</Text>
                {meta ? (
                  <Text className="mt-1 text-sm font-medium" style={{ color: theme.primary }}>
                    {meta}
                  </Text>
                ) : null}
                {group.description ? (
                  <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                    {group.description}
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => void onInterest(group.id)}
                  disabled={interested || busyId === group.id}
                  className="mt-3.5 items-center rounded-xl px-4 py-2.5"
                  style={{
                    backgroundColor: interested ? theme.card : theme.primary,
                    borderWidth: interested ? 1 : 0,
                    borderColor: theme.border,
                    opacity: busyId === group.id ? 0.6 : 1,
                  }}
                >
                  {busyId === group.id ? (
                    <ActivityIndicator color={theme.primaryForeground} />
                  ) : (
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: interested ? theme.text : theme.primaryForeground }}
                    >
                      {interested ? 'Interest sent' : "I'm interested"}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
