import { Stack } from 'expo-router';
import { ApiProvider } from '../src/providers/ApiProvider';
import { TenantProvider } from '../src/providers/TenantProvider';

export default function RootLayout() {
  return (
    <ApiProvider>
      <TenantProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TenantProvider>
    </ApiProvider>
  );
}
