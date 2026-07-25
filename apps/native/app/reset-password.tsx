import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlClass } from '../src/components/AuthField';
import { trpc } from '../src/lib/trpc';
import { cn } from '../src/lib/cn';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const tokenParam = typeof params.token === 'string' ? params.token.trim() : '';
  const { isReady, token: sessionToken } = useAuth();
  const [token, setToken] = useState(tokenParam);

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const resetPassword = trpc.auth.resetPassword.useMutation();

  if (!isReady || sessionToken) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#55bae8" />
      </View>
    );
  }

  const onSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword.mutateAsync({ token: token.trim(), password });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <AuthScreenShell
      title="Reset password"
      subtitle={done ? 'Your password was updated.' : 'Paste the code from your email and choose a new password.'}
      footer={
        <Text className={authControlClass.footerText}>
          <Link href="/login" className={authControlClass.link}>
            Back to sign in
          </Link>
        </Text>
      }
    >
      {done ? (
        <TouchableOpacity className={authControlClass.button} onPress={() => router.replace('/login')}>
          <Text className={authControlClass.buttonText}>Continue to sign in</Text>
        </TouchableOpacity>
      ) : (
        <>
          <AuthField
            label="Reset code"
            autoCapitalize="none"
            autoCorrect={false}
            value={token}
            onChangeText={setToken}
            placeholder="Paste code from email"
          />
          <AuthField
            label="New password"
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
          />
          <AuthField
            label="Confirm password"
            secureTextEntry
            textContentType="newPassword"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat new password"
          />
          {error ? <Text className={authControlClass.error}>{error}</Text> : null}
          <TouchableOpacity
            className={cn(
              authControlClass.button,
              (resetPassword.isPending || !token.trim() || !password) &&
                authControlClass.buttonDisabled
            )}
            onPress={() => void onSubmit()}
            disabled={resetPassword.isPending || !token.trim() || !password}
          >
            {resetPassword.isPending ? (
              <ActivityIndicator color="#061018" />
            ) : (
              <Text className={authControlClass.buttonText}>Update password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </AuthScreenShell>
  );
}
