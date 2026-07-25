import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';
import { ChurchTopBar } from '../../src/components/ChurchTopBar';
import { SafeAreaView } from '../../src/components/uniwind';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName, focusedName: IconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

export default function ChurchTabsLayout() {
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
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: theme.background }}>
      <StatusBar style="light" />
      <ChurchTopBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: '#908889',
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          sceneStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Tabs.Screen
          name="sermons"
          options={{
            title: 'Sermons',
            tabBarIcon: tabIcon('book-outline', 'book'),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: tabIcon('calendar-outline', 'calendar'),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: tabIcon('home-outline', 'home'),
          }}
        />
        <Tabs.Screen
          name="give"
          options={{
            title: 'Give',
            tabBarIcon: tabIcon('heart-outline', 'heart'),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: tabIcon('menu-outline', 'menu'),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
