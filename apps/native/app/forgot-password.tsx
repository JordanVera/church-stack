import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlClass } from '../src/components/AuthField';
import { trpc } from '../src/lib/trpc';
import { cn } from '../src/lib/cn';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isReady, token } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  if (!isReady || token) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#55bae8" />
      </View>
    );
  }

  const onSubmit = async () => {
    setError(null);
    try {
      await requestReset.mutateAsync({ email: email.trim() });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <AuthScreenShell
      title="Forgot password"
      subtitle={
        sent
          ? 'If an account exists for that email, we sent a reset link.'
          : 'Enter your email and we will send a reset link.'
      }
      footer={
        <Text className={authControlClass.footerText}>
          Remembered it?{' '}
          <Link href="/login" className={authControlClass.link}>
            Sign in
          </Link>
        </Text>
      }
    >
      {sent ? (
        <>
          <Text className="text-[15px] leading-[21px] text-muted-foreground">
            Check your inbox (and spam). The link expires in one hour. You can paste the code from
            the email on the next screen.
          </Text>
          <TouchableOpacity
            className={authControlClass.button}
            onPress={() => router.push('/reset-password')}
          >
            <Text className={authControlClass.buttonText}>Enter reset code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={cn(authControlClass.button, 'bg-transparent border border-white/25')}
            onPress={() => router.replace('/login')}
          >
            <Text className="text-center text-[16px] font-semibold text-foreground">
              Back to sign in
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <AuthField
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          {error ? <Text className={authControlClass.error}>{error}</Text> : null}
          <TouchableOpacity
            className={cn(
              authControlClass.button,
              (requestReset.isPending || !email.trim()) && authControlClass.buttonDisabled
            )}
            onPress={() => void onSubmit()}
            disabled={requestReset.isPending || !email.trim()}
          >
            {requestReset.isPending ? (
              <ActivityIndicator color="#061018" />
            ) : (
              <Text className={authControlClass.buttonText}>Send reset link</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </AuthScreenShell>
  );
}
