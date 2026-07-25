import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';
import { ChurchTopBar } from '../../src/components/ChurchTopBar';
import { SafeAreaView } from '../../src/components/uniwind';

export default function ChurchLayout() {
  const { isReady, token, isAuthenticated, meLoading } = useAuth();
  const { slug, theme, isLoading } = useTenant();

  if (!isReady || meLoading || (slug && isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!token || !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!slug) {
    return <Redirect href="/select" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ChurchTopBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account" />
        <Stack.Screen name="announcement/[id]" />
      </Stack>
    </SafeAreaView>
  );
}
