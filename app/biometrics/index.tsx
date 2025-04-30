import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Button, StyleSheet, Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Biometric } from "../models/biometricModel";
import { theme } from "../utils/theme"

const Biometrics = () => {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [timesPerWeek, setTimesPerWeek] = useState(""); // Keeps track of times per week
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [limitations, setLimitations] = useState("");
  const [workoutPreference, setWorkoutPreference] = useState("");
  const [equipmentPreference, setEquipmentPreference] = useState<string[]>([]);
  const [daysPreference, setDaysPreference] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  const goals = ["Lose weight", "Build muscle", "Maintain"];
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const locations = ["Gym", "Home", "No preference"];
  const timesOptions = ["1-2", "3-4", "5+"]; // The new multiple-choice options for workouts per week
  const equipmentChoice = ["Barbell", "Dumbell", "Machine", "Body weight", "Any"];
  const daysChoice = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

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
      daysPreference,
      fitnessGoal,
      experienceLevel,
      limitations,
      workoutPreference,
      equipmentPreference,
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

    const renderMultiSelectButtons = (options: string[], selected: string[], onSelect: (options: string[]) => void) => {
      return options.map((option) => {
        const isSelected = selected.includes(option);
    
        const handlePress = () => {
          if (isSelected) {
            // Remove if already selected
            onSelect(selected.filter(item => item !== option));
          } else {
            // Add if not selected
            onSelect([...selected, option]);
          }
        };
    
        return (
          <TouchableOpacity
            key={option}
            style={[styles.optionButton, isSelected && styles.selectedOption]}
            onPress={handlePress}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      });
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Fitness Profile</Text>

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />

      <Text style={styles.label}>Height (in ft/in)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />

      <Text style={styles.label}>Weight (in lbs)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

      <Text style={styles.label}>How many times a week do you want to workout?</Text>
      {renderOptionButtons(timesOptions, timesPerWeek, setTimesPerWeek)} {/* Render the multiple-choice options */}

      <Text style={styles.label}>What days of the week can you workout?</Text>
      {renderMultiSelectButtons(daysChoice, daysPreference, setDaysPreference)}

      <Text style={styles.label}>Fitness Goal</Text>
      {renderOptionButtons(goals, fitnessGoal, setFitnessGoal)}

      <Text style={styles.label}>Current Experience Level</Text>
      {renderOptionButtons(levels, experienceLevel, setExperienceLevel)}

      <Text style={styles.label}>Any limitations for working out? Ie. physical disabilites, injuries, medication, etc.</Text>
      <TextInput
          style={[styles.input, { height: 80 }]}  // Ensure the height is large enough for multiline input
          multiline={true}  // Allow multiple lines
          value={limitations}
          onChangeText={setLimitations}  // Ensure this correctly updates the limitations state
          placeholder="(optional)"
      />
      <Text style={styles.label}>Preferred Workout Location</Text>
      {renderOptionButtons(locations, workoutPreference, setWorkoutPreference)}

      <Text style={styles.label}>Preferred Equipment</Text>
      {renderMultiSelectButtons(equipmentChoice, equipmentPreference, setEquipmentPreference)}

      <Button title={loading ? "Submitting..." : "Submit"} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
};

export default Biometrics;

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: "bold",
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.medium,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.small,
    fontSize: theme.fontSize.medium,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
  },
  optionButton: {
    padding: theme.spacing.small,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.extraSmall,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
});
