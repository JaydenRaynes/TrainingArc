import { View } from "react-native";
import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const AnimationScreen: React.FC = () => {
  const animation = useRef<LottieView>(null);
  const router = useRouter();
  const { nextScreen, animationKey } = useLocalSearchParams();

  // Ensure nextScreen is always a string
  let destination = "/(tabs)/shop"; // default fallback

if (typeof nextScreen === "string") {
  destination = nextScreen;
} else if (Array.isArray(nextScreen) && nextScreen.length > 0) {
  destination = nextScreen[0];
}

console.log("AnimationScreen → Navigating to:", destination);


    const handleAnimationFinish = () => {
      router.replace(destination);
    };

  useEffect(() => {
    // Wait 5 seconds, then navigate
    animation.current?.play();

    const timer = setTimeout(() => {
      router.replace(destination);
    }, 5000);

    return () => clearTimeout(timer);
  }, [animationKey]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#061E44" }}>
      <Stack.Screen options ={{headerShown: false}} /> 
      <LottieView
        autoPlay
        loop={false}
        ref={animation}
        onAnimationFinish={handleAnimationFinish}
        style={{ width: 300, height: 300 }}
        source={require("../../assets/videos/Animation.json")}
      />
    </View>
  );
};

export default AnimationScreen;
