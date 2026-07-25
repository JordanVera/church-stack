import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTenant } from '../../src/providers/TenantProvider';

export default function AccountScreen() {
  const router = useRouter();
  const { branding, theme, clearTenant } = useTenant();
  const { user, memberships, signOut } = useAuth();
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
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
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
        <Text className="text-lg font-semibold" style={{ color: theme.text }}>
          Account
        </Text>
      </View>

      <View className="px-5 pt-2">
        <View
          className="rounded-2xl border px-4 py-4"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text className="text-base font-semibold" style={{ color: theme.text }}>
            {user?.name || 'Member'}
          </Text>
          {user?.email ? (
            <Text className="mt-1 text-sm" style={{ color: theme.muted }}>
              {user.email}
            </Text>
          ) : null}
          <Text className="mt-3 text-sm" style={{ color: theme.muted }}>
            {branding.name}
          </Text>
        </View>

        <View className="mt-6 gap-3">
          {canSwitchChurch ? (
            <TouchableOpacity
              onPress={onSwitchChurch}
              className="rounded-2xl border px-4 py-4"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.text }}>
                Switch church
              </Text>
              <Text className="mt-1 text-sm" style={{ color: theme.muted }}>
                Choose a different church on your account.
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => void onSignOut()}
            className="rounded-2xl border px-4 py-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text className="text-base font-semibold" style={{ color: theme.text }}>
              Sign out
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.muted }}>
              Sign out of Church Stack on this device.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
