import { View } from "react-native";
import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const AnimationScreen: React.FC = () => {
  const animation = useRef<LottieView>(null);
  const router = useRouter();
  const params = useLocalSearchParams(); // Get params safely

  // Ensure nextScreen is always a string
  const nextScreen: string = Array.isArray(params.nextScreen)
    ? params.nextScreen[0]
    : params.nextScreen || "/(tabs)/explore";

  useEffect(() => {
    // Wait 5 seconds, then navigate
    const timer = setTimeout(() => {
      router.push(nextScreen as any);
    }, 5000);

    return () => clearTimeout(timer);
  }, [nextScreen]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#061E44" }}>
      <Stack.Screen options ={{headerShown: false}} /> 
      <LottieView
        autoPlay
        loop={false}
        ref={animation}
        style={{ width: 300, height: 300 }}
        source={require("../../assets/videos/Animation.json")}
      />
    </View>
  );
};

export default AnimationScreen;
