import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlClass } from '../src/components/AuthField';
import { cn } from '../src/lib/cn';

export default function LoginScreen() {
  const { signIn, isReady, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isReady || token) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#55bae8" />
      </View>
    );
  }

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Sign in"
      subtitle="Welcome back — pick up where your church left off."
      footer={
        <Text className={authControlClass.footerText}>
          New here?{' '}
          <Link href="/signup" className={authControlClass.link}>
            Create an account
          </Link>
        </Text>
      }
    >
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
      <AuthField
        label="Password"
        secureTextEntry
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
      />
      <Link href="/forgot-password" className={cn(authControlClass.link, 'self-end text-[13px]')}>
        Forgot password?
      </Link>
      {error ? <Text className={authControlClass.error}>{error}</Text> : null}
      <TouchableOpacity
        className={cn(authControlClass.button, loading && authControlClass.buttonDisabled)}
        onPress={onSubmit}
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#061018" />
        ) : (
          <Text className={authControlClass.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      <Text className="text-yellow-400 font-bold mx-auto">vera.jojo96@gmail.com</Text>
      <Text className="text-yellow-400 font-bold mx-auto">Jordan96</Text>
    </AuthScreenShell>
  );
}
