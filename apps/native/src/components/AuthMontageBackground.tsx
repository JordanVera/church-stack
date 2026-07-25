import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from './uniwind';

const SLIDES = [
  require('../../assets/auth/montage-1.png'),
  require('../../assets/auth/montage-2.png'),
  require('../../assets/auth/montage-3.png'),
] as const;

const HOLD_MS = 5200;
const FADE_MS = 1400;
const ZOOM_MS = HOLD_MS + FADE_MS;

/**
 * Full-bleed cinematic montage: crossfading stills with slow Ken Burns zoom.
 * Animated opacity/scale stay as style; static wrapper uses className.
 */
export function AuthMontageBackground() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const opacities = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const scales = useRef(SLIDES.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const zoom = Animated.timing(scales[index]!, {
      toValue: 1.12,
      duration: ZOOM_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    zoom.start();

    const timer = setTimeout(() => {
      const next = (index + 1) % SLIDES.length;
      scales[next]!.setValue(1);
      Animated.parallel([
        Animated.timing(opacities[index]!, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacities[next]!, {
          toValue: 1,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setIndex(next);
      });
    }, HOLD_MS);

    return () => {
      clearTimeout(timer);
      zoom.stop();
    };
  }, [index, opacities, scales]);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {SLIDES.map((src, i) => (
        <Animated.View
          key={i}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: opacities[i],
              transform: [{ scale: scales[i]! }],
            },
          ]}
        >
          <Image source={src} style={{ width, height }} resizeMode="cover" />
        </Animated.View>
      ))}

      <LinearGradient
        colors={['rgba(34,24,28,0.35)', 'rgba(34,24,28,0.62)', 'rgba(34,24,28,0.94)']}
        locations={[0, 0.42, 1]}
        className="absolute inset-0"
      />
    </View>
  );
}
