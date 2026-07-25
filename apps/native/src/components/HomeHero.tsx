import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from './uniwind';

const HERO_IMAGE = require('../../assets/auth/montage-1.png');

type Props = {
  churchName: string;
  tagline?: string | null;
  nextService: string | null;
  primaryColor: string;
  onPressNextService?: () => void;
};

/** Full-bleed photo hero with Welcome, church name, and next service. */
export function HomeHero({
  churchName,
  tagline,
  nextService,
  primaryColor,
  onPressNextService,
}: Props) {
  return (
    <View className="relative w-full overflow-hidden" style={{ height: 300 }}>
      <Image
        source={HERO_IMAGE}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        contentFit="cover"
        transition={300}
      />

      {/* Soft brand wash + readability scrim */}
      <LinearGradient
        colors={['rgba(10,8,12,0.15)', 'rgba(10,8,12,0.45)', 'rgba(10,8,12,0.88)']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <LinearGradient
        colors={[`${primaryColor}66`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />

      <View className="h-full justify-end px-5 pb-6 pt-12">
        <Text className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">
          Welcome
        </Text>
        <Text
          className="mt-2 text-[34px] font-bold leading-tight tracking-tight text-white"
          numberOfLines={2}
        >
          {churchName}
        </Text>
        {tagline ? (
          <Text className="mt-2 text-[15px] leading-5 text-white/80" numberOfLines={2}>
            {tagline}
          </Text>
        ) : null}

        {nextService ? (
          <Pressable
            onPress={onPressNextService}
            className="mt-5 flex-row items-center rounded-2xl border border-white/20 px-4 py-3.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                Next service
              </Text>
              <Text className="mt-0.5 text-[15px] font-semibold text-white" numberOfLines={2}>
                {nextService}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
