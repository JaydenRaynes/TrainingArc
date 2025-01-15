import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login/index" options={{ title: "Login" }} />
      <Stack.Screen name="signup/index" options={{ title: "Signup" }} />
      <Stack.Screen name="biometrics/index" options={{ title: "Biometrics" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
