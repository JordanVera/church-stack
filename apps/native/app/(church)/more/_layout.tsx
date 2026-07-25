import { Stack } from 'expo-router';
import { useTenant } from '../../../src/providers/TenantProvider';

export default function MoreStackLayout() {
  const { theme } = useTenant();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
