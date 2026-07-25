import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenHeader } from '../../../../src/components/StackScreenHeader';
import { usePublicSite } from '../../../../src/hooks/usePublicSite';
import { useTenant } from '../../../../src/providers/TenantProvider';

type LinkRow = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

export default function ContactScreen() {
  const { theme } = useTenant();
  const site = usePublicSite();
  const contact = site.data?.contact;
  const social = site.data?.social;

  const rows: LinkRow[] = [];
  if (contact?.phone) {
    rows.push({
      label: 'Phone',
      value: contact.phone,
      icon: 'call-outline',
      href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`,
    });
  }
  if (contact?.email) {
    rows.push({
      label: 'Email',
      value: contact.email,
      icon: 'mail-outline',
      href: `mailto:${contact.email}`,
    });
  }
  if (contact?.address) {
    rows.push({
      label: 'Address',
      value: contact.address,
      icon: 'location-outline',
      href: `https://maps.apple.com/?q=${encodeURIComponent(contact.address)}`,
    });
  }
  if (social?.facebookUrl) {
    rows.push({
      label: 'Facebook',
      value: 'Open Facebook',
      icon: 'logo-facebook',
      href: social.facebookUrl,
    });
  }
  if (social?.instagramUrl) {
    rows.push({
      label: 'Instagram',
      value: 'Open Instagram',
      icon: 'logo-instagram',
      href: social.instagramUrl,
    });
  }
  if (social?.youtubeUrl) {
    rows.push({
      label: 'YouTube',
      value: 'Open YouTube',
      icon: 'logo-youtube',
      href: social.youtubeUrl,
    });
  }
  if (social?.threadsUrl) {
    rows.push({
      label: 'Threads',
      value: 'Open Threads',
      icon: 'chatbubble-ellipses-outline',
      href: social.threadsUrl,
    });
  }

  return (
    <View className="flex-1 bg-background">
      <StackScreenHeader title="Contact" />
      {site.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            No contact details listed yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-2.5 p-5 pb-10">
          {rows.map((row) => (
            <Pressable
              key={row.label + row.href}
              onPress={() => void Linking.openURL(row.href)}
              className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: theme.primary }}
              >
                <Ionicons name={row.icon} size={18} color={theme.primaryForeground} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </Text>
                <Text className="mt-0.5 text-base font-medium text-foreground" numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={theme.muted} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
