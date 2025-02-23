import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function BiometricsForm() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [activityLevel, setActivityLevel] = useState("Moderately Active");
  const [preferences, setPreferences] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }

    if (!height || !weight || !goal || !preferences || !gender || !activityLevel) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        age: parseInt(age),
        gender,
        goal,
        height: parseInt(height),
        weight: parseInt(weight),
        activityLevel,
        preferences: {
          trainingType: "Strength",
          cardioPreference: "Low",
          gymEquipment: true,
          focusAreas: preferences.split(",").map((p) => p.trim()),
        },
      });

      Alert.alert("Success", "Your data has been updated!");
      router.push("/(tabs)/explore");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save your data. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#0D0D0D", "#191a2f"]} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Animated.Text style={styles.title} entering={FadeIn.duration(1000)}>
              Enter Your Biometrics
            </Animated.Text>

            <Animated.View style={styles.inputContainer} entering={FadeInDown.duration(1000).delay(200)}>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#B0B0B0"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
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
                placeholder="Your Goal (e.g., Muscle Gain, Weight Loss)"
                placeholderTextColor="#B0B0B0"
                value={goal}
                onChangeText={setGoal}
              />

              {/* Gender Dropdown */}
              <Picker
                selectedValue={gender}
                style={styles.picker}
                onValueChange={(itemValue) => setGender(itemValue)}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>

              {/* Activity Level Dropdown */}
              <Picker
                selectedValue={activityLevel}
                style={styles.picker}
                onValueChange={(itemValue) => setActivityLevel(itemValue)}
              >
                <Picker.Item label="Sedentary (Little to no exercise)" value="Sedentary" />
                <Picker.Item label="Lightly Active (1-3 days per week)" value="Lightly Active" />
                <Picker.Item label="Moderately Active (3-5 days per week)" value="Moderately Active" />
                <Picker.Item label="Very Active (6-7 days per week)" value="Very Active" />
              </Picker>

              <TextInput
                style={styles.input}
                placeholder="Training Preferences (e.g., Strength, Cardio, Full Body)"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingBottom: 40 },

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

  picker: {
    width: "85%",
    backgroundColor: "#1E1E2D",
    color: "#FFF",
    marginVertical: 10,
    paddingVertical: 8,
    borderRadius: 10,
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
