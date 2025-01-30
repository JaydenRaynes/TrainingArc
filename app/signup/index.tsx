import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = () => {
    if (loading) return;

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (email && password) {
      setLoading(true);
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await setDoc(doc(db, "users", user.uid), {
            isFirstLogin: true,
            email: user.email,
          });
          Alert.alert("Success", "Account created successfully!");
          router.push("/(tabs)/explore");
        })
        .catch((error) => {
          console.error("Signup Error:", error);
          Alert.alert("Error", error.message);
        })
        .finally(() => {
          setLoading(false);
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
          Create Your Account
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </Animated.View>

        {/* Signup Button */}
        <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFA500" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Login Link */}
        <Animated.Text
          style={styles.link}
          onPress={() => router.push("/login")}
          entering={FadeInDown.duration(1000).delay(600)}
        >
          Already have an account? <Text style={{ color: "#FFA500" }}>Login</Text>
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
