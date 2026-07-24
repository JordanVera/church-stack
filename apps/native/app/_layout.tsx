import { Stack } from 'expo-router';
import { ApiProvider } from '../src/providers/ApiProvider';
import { AuthProvider } from '../src/providers/AuthProvider';
import { TenantProvider } from '../src/providers/TenantProvider';
import { AuthRedirect } from '../src/components/AuthRedirect';

export default function RootLayout() {
  return (
    <ApiProvider>
      <AuthProvider>
        <TenantProvider>
          <AuthRedirect />
          <Stack screenOptions={{ headerShown: false }} />
        </TenantProvider>
      </AuthProvider>
    </ApiProvider>
  );
}
