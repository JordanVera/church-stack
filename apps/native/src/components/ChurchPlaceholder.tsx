import { Text, View } from 'react-native';
import { useTenant } from '../providers/TenantProvider';

type Props = {
  title: string;
  description: string;
};

/** Shared placeholder for church tabs that are not built out yet. */
export function ChurchPlaceholder({ title, description }: Props) {
  const { theme } = useTenant();

  return (
    <View className="flex-1 px-6 pt-8" style={{ backgroundColor: theme.background }}>
      <Text className="text-[28px] font-bold tracking-tight" style={{ color: theme.text }}>
        {title}
      </Text>
      <Text className="mt-3 text-base leading-6" style={{ color: theme.muted }}>
        {description}
      </Text>
      <View
        className="mt-8 rounded-2xl border px-4 py-5"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
          Coming soon
        </Text>
        <Text className="mt-1.5 text-sm leading-5" style={{ color: theme.muted }}>
          This section will be available in a future update.
        </Text>
      </View>
    </View>
  );
}
