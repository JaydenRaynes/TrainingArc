import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();

  return (
    
    <LinearGradient colors={["#FFFFFF", "#191a2f"]} style={styles.background}>
      <View style={styles.container}>

      <Animated.Image
          source={require("../assets/images/Training_arc.jpg")} // ✅ Ensure the image is in the assets folder
          style={styles.logo}
          entering={FadeIn.duration(1200)}
        /> 

        {/* Animated Title */}
        <Animated.Text style={styles.title} entering={FadeIn.duration(1000)}>
          Welcome to Training Arc!
        </Animated.Text>

        {/* Animated Buttons */}
        <Animated.View style={styles.buttonContainer} entering={FadeInDown.duration(1000).delay(200)}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/signup")}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },

  logo: {
    width: 150, // Adjust size as needed
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
    borderRadius: 20,
    padding: -20,

  },

  title: { fontSize: 28, fontWeight: "bold", color: "#0D0D0D", marginBottom: 20, textAlign: "center" },
  buttonContainer: { width: "100%", alignItems: "center" },
  button: {
    backgroundColor: "#0D0D0D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "0D0D0D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#FFA500" },
  
});
