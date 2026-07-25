import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTenant } from '../../../src/providers/TenantProvider';

type IconName = keyof typeof Ionicons.glyphMap;

/** Home is the app entry tab (not Sermons, which is first in the bar). */
export const unstable_settings = {
  initialRouteName: 'index',
};

function tabIcon(name: IconName, focusedName: IconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

export default function ChurchTabsLayout() {
  const { theme } = useTenant();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mode === 'dark' ? '#908889' : '#787272',
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
    </Tabs>
  );
}
