import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTenant } from '../../../src/providers/TenantProvider';

type Row = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const ROWS: Row[] = [
  {
    title: 'Visit',
    subtitle: 'Campuses and service times',
    icon: 'map-outline',
    href: '/more/visit',
  },
  {
    title: 'Plan a visit',
    subtitle: 'Let us know you’re coming',
    icon: 'hand-left-outline',
    href: '/more/plan-visit',
  },
  {
    title: 'Life groups',
    subtitle: 'Find community during the week',
    icon: 'people-outline',
    href: '/more/groups',
  },
  {
    title: 'Leadership',
    subtitle: 'Meet the pastors and team',
    icon: 'person-outline',
    href: '/more/pastors',
  },
  {
    title: 'Contact',
    subtitle: 'Call, email, and social',
    icon: 'call-outline',
    href: '/more/contact',
  },
  {
    title: 'My registrations',
    subtitle: 'Events you’ve signed up for',
    icon: 'checkmark-circle-outline',
    href: '/more/registrations',
  },
  {
    title: 'Prayer',
    subtitle: 'Share a prayer request',
    icon: 'heart-outline',
    href: '/more/prayer',
  },
  {
    title: 'Account',
    subtitle: 'Appearance, church, and sign out',
    icon: 'settings-outline',
    href: '/account',
  },
];

export default function MoreHubScreen() {
  const router = useRouter();
  const { branding, theme } = useTenant();

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 pb-10 pt-6">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">More</Text>
        <Text className="mt-1 text-base text-muted-foreground">{branding.name}</Text>

        <View className="mt-6 gap-2.5">
          {ROWS.map((row) => (
            <Pressable
              key={row.href}
              onPress={() => router.push(row.href as never)}
              className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: theme.primary }}
              >
                <Ionicons name={row.icon} size={20} color={theme.primaryForeground} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-semibold text-foreground">{row.title}</Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">{row.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
