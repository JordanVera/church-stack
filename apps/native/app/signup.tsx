import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlClass } from '../src/components/AuthField';
import { cn } from '../src/lib/cn';

export default function SignupScreen() {
  const { signUp, isReady, token } = useAuth();
  const [name, setName] = useState('');
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
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      title="Create account"
      subtitle="Join your church community in a couple of steps."
      footer={
        <Text className={authControlClass.footerText}>
          Already have an account?{' '}
          <Link href="/login" className={authControlClass.link}>
            Sign in
          </Link>
        </Text>
      }
    >
      <AuthField
        label="Name"
        autoCorrect={false}
        textContentType="name"
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />
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
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
      />
      {error ? <Text className={authControlClass.error}>{error}</Text> : null}
      <TouchableOpacity
        className={cn(authControlClass.button, loading && authControlClass.buttonDisabled)}
        onPress={onSubmit}
        disabled={loading || !name || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#061018" />
        ) : (
          <Text className={authControlClass.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>
    </AuthScreenShell>
  );
}
