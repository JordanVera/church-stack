import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';
import { useAppearance } from '../../src/providers/AppearanceProvider';
import type { AppearancePreference } from '../../src/lib/appearance-store';
import { cn } from '../../src/lib/cn';

const THEME_OPTIONS: { value: AppearancePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function AccountScreen() {
  const router = useRouter();
  const { branding, theme, clearTenant } = useTenant();
  const { user, memberships, signOut } = useAuth();
  const { preference, setPreference } = useAppearance();
  const canSwitchChurch = (memberships?.length ?? 0) !== 1;

  const onSwitchChurch = () => {
    clearTenant();
    router.replace('/select');
  };

  const onSignOut = async () => {
    clearTenant();
    await signOut();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 h-9 w-9 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">Account</Text>
      </View>

      <View className="px-5 pt-2">
        <View className="rounded-2xl border border-border bg-card px-4 py-4">
          <Text className="text-base font-semibold text-foreground">
            {user?.name || 'Member'}
          </Text>
          {user?.email ? (
            <Text className="mt-1 text-sm text-muted-foreground">{user.email}</Text>
          ) : null}
          <Text className="mt-3 text-sm text-muted-foreground">{branding.name}</Text>
        </View>

        <Text className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Appearance
        </Text>
        <View className="flex-row gap-2">
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={cn(
                  'flex-1 items-center rounded-2xl border px-2 py-3',
                  active ? 'border-transparent' : 'border-border bg-card'
                )}
                style={active ? { backgroundColor: theme.primary } : undefined}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={active ? theme.primaryForeground : theme.muted}
                />
                <Text
                  className={cn('mt-1.5 text-xs font-semibold')}
                  style={{ color: active ? theme.primaryForeground : theme.text }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 gap-3">
          {canSwitchChurch ? (
            <TouchableOpacity
              onPress={onSwitchChurch}
              className="rounded-2xl border border-border bg-card px-4 py-4"
            >
              <Text className="text-base font-semibold text-foreground">Switch church</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Choose a different church on your account.
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => void onSignOut()}
            className="rounded-2xl border border-border bg-card px-4 py-4"
          >
            <Text className="text-base font-semibold text-foreground">Sign out</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Sign out of Church Stack on this device.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
