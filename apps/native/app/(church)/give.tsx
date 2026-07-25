import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTenant } from '../../src/providers/TenantProvider';

export default function GiveScreen() {
  const { branding, theme } = useTenant();
  const givingUrl = branding.givingUrl?.trim() || null;
  const givingEnabled = branding.features.giving;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!givingEnabled || !givingUrl) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base leading-6 text-muted-foreground">
          {!givingEnabled
            ? "Giving isn't available for this church."
            : 'No giving link has been set up yet.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {loading && !error ? (
        <View className="absolute inset-0 z-10 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base leading-6 text-muted-foreground">
            Couldn't open the giving page. Try again later.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: givingUrl }}
          style={{ flex: 1, backgroundColor: theme.background }}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onHttpError={() => {
            setLoading(false);
            setError(true);
          }}
          startInLoadingState={false}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
        />
      )}
    </View>
  );
}
