import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { setupNotificationHandler } from './utils/notifications-setup';

export default function RootLayout() {
  useEffect(() => {
    setupNotificationHandler();
  }, []);
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="signup/index" options={{ headerShown: false}} />
      <Stack.Screen name="biometrics/index" options={{ headerShown: false}} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
