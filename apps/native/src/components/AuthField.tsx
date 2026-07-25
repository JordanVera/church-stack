import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { cn } from '../lib/cn';

type FieldProps = {
  label: string;
  error?: string | null;
  className?: string;
} & TextInputProps;

export function AuthField({ label, error, className, style, ...props }: FieldProps) {
  return (
    <View>
      <Text className="mb-1.5 text-[13px] font-semibold tracking-wide text-ink-100">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="rgba(246,232,234,0.45)"
        className={cn(
          'rounded-[14px] border border-input bg-white/10 px-3.5 py-3 text-base text-foreground',
          className
        )}
        style={style}
      />
      {error ? <Text className="mt-1.5 text-[13px] text-destructive">{error}</Text> : null}
    </View>
  );
}

export const authControlClass = {
  button: 'mt-1.5 items-center rounded-[14px] bg-brand-400 py-[15px]',
  buttonDisabled: 'opacity-55',
  buttonText: 'text-base font-bold text-primary-foreground',
  footerText: 'text-center text-[15px] text-muted-foreground',
  link: 'font-bold text-brand-300',
  error: 'mt-1 mb-0.5 text-sm text-destructive',
} as const;
