import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { AuthScreenShell } from '../src/components/AuthScreenShell';
import { AuthField, authControlStyles } from '../src/components/AuthField';

export default function SignupScreen() {
  const { signUp, isReady, token } = useAuth();
  const [name, setName] = useState('');
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
        <Text style={authControlStyles.footerText}>
          Already have an account?{' '}
          <Link href="/login" style={authControlStyles.link}>
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
      {error ? <Text style={authControlStyles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[authControlStyles.button, loading && authControlStyles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading || !name || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#061018" />
        ) : (
          <Text style={authControlStyles.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>
    </AuthScreenShell>
  );
}
