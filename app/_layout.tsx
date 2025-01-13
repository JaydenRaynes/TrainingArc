import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* By default, expo-router automatically picks up files for routes */}
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login/index" options={{ title: "Login" }} />
      <Stack.Screen name="signup/index" options={{ title: "Signup" }} />
      <Stack.Screen name="biometrics/index" options={{ title: "Biometrics" }} />
    </Stack>
  );
}
