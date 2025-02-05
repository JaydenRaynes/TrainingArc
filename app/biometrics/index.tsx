import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function BiometricsForm() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [preferences, setPreferences] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }

    if (!height || !weight || !goal || !preferences) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        height,
        weight,
        goal,
        preferences,
      });
      Alert.alert("Success", "Your data has been saved!");
      router.push("/(tabs)/explore");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save your data. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#0D0D0D", "#191a2f"]} style={styles.background}>
      <View style={styles.container}>
        {/* Animated Logo */}
        {/* <Animated.Image
          source={require("../assets/images/Training_arc.jpg")} // Ensure the image is in assets
          style={styles.logo}
          entering={FadeIn.duration(1200)}
        /> */}

        {/* Animated Title */}
        <Animated.Text style={styles.title} entering={FadeIn.duration(1000)}>
          Enter Your Biometrics
        </Animated.Text>

        {/* Input Fields */}
        <Animated.View style={styles.inputContainer} entering={FadeInDown.duration(1000).delay(200)}>
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            placeholderTextColor="#B0B0B0"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            placeholderTextColor="#B0B0B0"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Your Goal"
            placeholderTextColor="#B0B0B0"
            value={goal}
            onChangeText={setGoal}
          />
          <TextInput
            style={styles.input}
            placeholder="Training Preferences"
            placeholderTextColor="#B0B0B0"
            value={preferences}
            onChangeText={setPreferences}
          />
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save</Text>
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
});
