import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Button, StyleSheet, Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Biometric } from "../models/biometricModel";

const Biometrics = () => {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [timesPerWeek, setTimesPerWeek] = useState(""); // Keeps track of times per week
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [limitations, setLimitations] = useState("");
  const [workoutPreference, setWorkoutPreference] = useState("");

  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  const goals = ["Lose weight", "Build muscle", "Maintain"];
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const locations = ["Gym", "Home", "No preference"];
  const timesOptions = ["1-2", "3-4", "5+"]; // The new multiple-choice options for workouts per week

  const handleSubmit = async () => {
    if (!age || !height || !weight || !timesPerWeek || !fitnessGoal || !experienceLevel || !workoutPreference) {
      Alert.alert("Please complete all fields.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const biometricsData: Biometric = {
      age: parseInt(age),
      height,
      weight,
      timesPerWeek, // Storing the selected multiple-choice value
      fitnessGoal,
      experienceLevel,
      limitations,
      workoutPreference,
      biometricsComplete: true,
    };

    try {
      setLoading(true);
      await setDoc(doc(db, "users", user.uid, "newBiometrics", "data"), biometricsData, { merge: true });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving biometrics:", error);
      Alert.alert("Error saving your data.");
    }
    setLoading(false);
  };

  const renderOptionButtons = (options, selected, onSelect) =>
    options.map((option) => (
      <TouchableOpacity
        key={option}
        style={[styles.optionButton, selected === option && styles.selectedOption]}
        onPress={() => onSelect(option)}
      >
        <Text style={styles.optionText}>{option}</Text>
      </TouchableOpacity>
    ));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Fitness Profile</Text>

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />

      <Text style={styles.label}>Height (in cm or ft/in)</Text>
      <TextInput style={styles.input} value={height} onChangeText={setHeight} />

      <Text style={styles.label}>Weight (in lbs or kg)</Text>
      <TextInput style={styles.input} value={weight} onChangeText={setWeight} />

      <Text style={styles.label}>How many times a week do you want to workout?</Text>
      {renderOptionButtons(timesOptions, timesPerWeek, setTimesPerWeek)} {/* Render the multiple-choice options */}

      <Text style={styles.label}>Fitness Goal</Text>
      {renderOptionButtons(goals, fitnessGoal, setFitnessGoal)}

      <Text style={styles.label}>Current Experience Level</Text>
      {renderOptionButtons(levels, experienceLevel, setExperienceLevel)}

      <Text style={styles.label}>Any limitations for working out?</Text>
      <TextInput
          style={[styles.input, { height: 80 }]}  // Ensure the height is large enough for multiline input
          multiline={true}  // Allow multiple lines
          value={limitations}
          onChangeText={setLimitations}  // Ensure this correctly updates the limitations state
          placeholder="(optional)"
      />
      <Text style={styles.label}>Preferred Workout Location</Text>
      {renderOptionButtons(locations, workoutPreference, setWorkoutPreference)}

      <Button title={loading ? "Submitting..." : "Submit"} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
};

export default Biometrics;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  optionButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#add8e6",
  },
  optionText: {
    fontSize: 16,
  },
});
