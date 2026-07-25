import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlStyles } from '../src/components/AuthField';

export default function LoginScreen() {
  const { signIn, isReady, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isReady || token) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0c1218', justifyContent: 'center' }}>
        <ActivityIndicator color="#7dd3f0" />
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
        <Text style={authControlStyles.footerText}>
          New here?{' '}
          <Link href="/signup" style={authControlStyles.link}>
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
      {error ? <Text style={authControlStyles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[authControlStyles.button, loading && authControlStyles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#061018" />
        ) : (
          <Text style={authControlStyles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>
    </AuthScreenShell>
  );
}
