import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthMontageBackground } from './AuthMontageBackground';
import { SafeAreaView } from './uniwind';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shared cinematic shell for sign-in / create-account. */
export function AuthScreenShell({ title, subtitle, children, footer }: Props) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      delay: 80,
    }).start();
  }, [enter]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <AuthMontageBackground />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <Animated.View
            className="flex-1 justify-end px-6 pb-5"
            style={{
              opacity: enter,
              transform: [
                {
                  translateY: enter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            }}
          >
            <View className="mb-7">
              <Text className="text-[28px] font-bold tracking-tight text-foreground">{title}</Text>
              <Text className="mt-1.5 text-[15px] leading-[21px] text-muted-foreground">
                {subtitle}
              </Text>
            </View>

            <View className="gap-3.5">{children}</View>
            <View className="mt-[22px] mb-2">{footer}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
