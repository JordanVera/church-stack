import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTenant } from '../providers/TenantProvider';

type Props = {
  title: string;
};

export function StackScreenHeader({ title }: Props) {
  const router = useRouter();
  const { theme } = useTenant();

  return (
    <View className="flex-row items-center border-b border-border px-4 py-3">
      <TouchableOpacity
        onPress={() => router.back()}
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
