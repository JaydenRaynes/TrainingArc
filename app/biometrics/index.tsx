import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function BiometricsForm() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [preferences, setPreferences] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser; // Get the current logged-in user
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }

    if (!height || !weight || !goal || !preferences) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      // Save data to Firestore
      const docRef = doc(db, "users", user.uid); // Each user gets their own document
      await setDoc(docRef, {
        height,
        weight,
        goal,
        preferences,
      });
      Alert.alert("Success", "Your data has been saved!");
      router.push("/"); // Navigate back to the home screen
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save your data. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Biometrics</Text>
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Your Goal"
        value={goal}
        onChangeText={setGoal}
      />
      <TextInput
        style={styles.input}
        placeholder="Training Preferences"
        value={preferences}
        onChangeText={setPreferences}
      />
      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
});
