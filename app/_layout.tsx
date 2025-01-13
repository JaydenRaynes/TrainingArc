import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)"
        options={{
          headerTitle: () => 
            <p>Training Arc</p>
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
