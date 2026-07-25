import { Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTenant } from '../providers/TenantProvider';

type Props = {
  title: string;
  /**
   * Default parent when there is no `from` query param.
   * More sub-screens use `/more`; announcement uses `/`.
   */
  fallbackHref?: string;
  /**
   * For parent-stack screens (account, announcement): pop history when possible.
   */
  preferHistory?: boolean;
};

export function StackScreenHeader({
  title,
  fallbackHref = '/more',
  preferHistory = false,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const { theme } = useTenant();

  const from = Array.isArray(params.from) ? params.from[0] : params.from;

  const onBack = () => {
    // Home quick links open More screens with ?from=home — return there.
    if (from === 'home') {
      router.navigate('/');
      return;
    }
    if (preferHistory && router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate(fallbackHref as never);
  };

  return (
    <View className="flex-row items-center border-b border-border px-4 py-3">
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="mr-3 h-9 w-9 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text className="flex-1 text-lg font-semibold text-foreground" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
