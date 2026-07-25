import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

type FieldProps = {
  label: string;
  error?: string | null;
} & TextInputProps;

export function AuthField({ label, error, style, ...props }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="rgba(244,247,250,0.52)"
        style={[styles.input, style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export const authControlStyles = StyleSheet.create({
  button: {
    marginTop: 6,
    backgroundColor: '#2aa3d4',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#061018', fontSize: 16, fontWeight: '700' },
  footerText: {
    fontSize: 15,
    color: 'rgba(232,238,244,0.7)',
    textAlign: 'center',
  },
  link: { color: '#7dd3f0', fontWeight: '700' },
  error: { marginTop: 4, marginBottom: 2, color: '#ff8f8f', fontSize: 14 },
});

const styles = StyleSheet.create({
  label: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: 'rgba(244,247,250,0.86)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(244,247,250,0.38)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#f4f7fa',
  },
  error: { marginTop: 6, color: '#ff8f8f', fontSize: 13 },
});
