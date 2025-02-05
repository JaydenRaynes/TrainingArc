import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const userData = docSnap.data();
  
            // Store the next destination based on whether it's the first login
            const nextScreen = userData.isFirstLogin ? "/biometrics" : "/(tabs)/explore";
  
            // Navigate to animation screen with the nextScreen as a parameter
            router.push({
              pathname: "/Animation/animation",
              params: { nextScreen }, // Pass the next screen destination
            });
          }
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "Please enter valid credentials.");
    }
  };
  

  return (
    <LinearGradient colors={["#0D0D0D", "#191a2f"]} style={styles.background}>
      <View style={styles.container}>
        {/* Animated Logo */}
        <Animated.Image
          source={require("../../assets/images/Training_arc.jpg")}
          style={styles.logo}
          entering={FadeIn.duration(1200)}
        />

        {/* Animated Title */}
        <Animated.Text style={styles.title} entering={FadeIn.duration(1000)}>
          Login
        </Animated.Text>

        {/* Input Fields */}
        <Animated.View style={styles.inputContainer} entering={FadeInDown.duration(1000).delay(200)}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </Animated.View>

        {/* Login Button */}
        <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Signup Link */}
        <Animated.Text
          style={styles.link}
          onPress={() => router.push("/signup")}
          entering={FadeInDown.duration(1000).delay(600)}
        >
          Don't have an account? <Text style={{ color: "#FFA500" }}>Sign up</Text>
        </Animated.Text>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
    borderRadius: 20,
  },

  title: { fontSize: 28, fontWeight: "bold", color: "#FFA500", marginBottom: 20, textAlign: "center" },

  inputContainer: { width: "100%", alignItems: "center" },

  input: {
    width: "85%",
    backgroundColor: "#1E1E2D",
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    color: "#FFF",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonText: { fontSize: 18, fontWeight: "bold", color: "#0D0D0D" },

  link: { color: "#FFFFFF", textAlign: "center", marginTop: 20, fontSize: 16 },
});
