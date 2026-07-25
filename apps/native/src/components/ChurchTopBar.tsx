import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { useTenant } from '../providers/TenantProvider';

function userInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.trim() || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** Slim chrome bar: church name + account avatar. */
export function ChurchTopBar() {
  const router = useRouter();
  const { branding, theme } = useTenant();
  const { user } = useAuth();
  const initials = userInitials(user?.name, user?.email);

  return (
    <View
      className="relative flex-row items-center justify-end px-4"
      style={{
        backgroundColor: theme.background,
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
        height: 48,
      }}
    >
      <Text
        className="absolute inset-x-12 text-center text-[15px] font-bold"
        style={{ color: theme.text }}
        numberOfLines={1}
      >
        {branding.name}
      </Text>

      <Pressable
        onPress={() => router.push('/account')}
        accessibilityRole="button"
        accessibilityLabel="Manage account"
        hitSlop={8}
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-xs font-bold" style={{ color: theme.primaryForeground }}>
          {initials}
        </Text>
      </Pressable>
    </View>
  );
}
