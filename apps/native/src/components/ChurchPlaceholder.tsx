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
    <View className="flex-1 bg-background px-6 pt-8">
      <Text className="text-[28px] font-bold tracking-tight text-foreground">{title}</Text>
      <Text className="mt-3 text-base leading-6 text-muted-foreground">{description}</Text>
      <View className="mt-8 rounded-2xl border border-border bg-card px-4 py-5">
        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
          Coming soon
        </Text>
        <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">
          This section will be available in a future update.
        </Text>
      </View>
    </View>
  );
}
