import '../global.css';
import { Stack } from 'expo-router';
import { ApiProvider } from '../src/providers/ApiProvider';
import { AuthProvider } from '../src/providers/AuthProvider';
import { TenantProvider } from '../src/providers/TenantProvider';
import { AppearanceProvider } from '../src/providers/AppearanceProvider';
import { AuthRedirect } from '../src/components/AuthRedirect';
import { PushRegistration } from '../src/components/PushRegistration';

export default function RootLayout() {
  return (
    <ApiProvider>
      <AppearanceProvider>
        <AuthProvider>
          <TenantProvider>
            <AuthRedirect />
            <PushRegistration />
            <Stack screenOptions={{ headerShown: false }} />
          </TenantProvider>
        </AuthProvider>
      </AppearanceProvider>
    </ApiProvider>
  );
}
