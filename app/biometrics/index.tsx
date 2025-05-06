import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Button, StyleSheet, Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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
  const [workoutGroupPreference, setWorkoutGroupPreference] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  const goals = ["Lose weight", "Build muscle", "Maintain"];
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const locations = ["Gym", "Home", "No preference"];
  const timesOptions = ["1-2", "3-4", "5+"]; // The new multiple-choice options for workouts per week
  const equipmentChoice = ["Barbell", "Dumbell", "Machine", "Body-weight", "Resistance Band", "Kettlebell"];
  const daysChoice = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  const workoutGroupChoice = ["Arms","Chest","Back","Shoulder","Legs","Core","Cardio"]


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
      timesPerWeek: "7",
      daysPreference,
      fitnessGoal,
      experienceLevel,
      limitations,
      workoutPreference,
      equipmentPreference,
      workoutGroupPreference,
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

  useEffect(() => {
    const loadBiometrics = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      try {
        const docRef = doc(db, "users", user.uid, "newBiometrics", "data");
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
  
          setAge(data.age?.toString() || "");
          setHeight(data.height || "");
          setWeight(data.weight || "");
          setTimesPerWeek(data.timesPerWeek || "");
          setDaysPreference(data.daysPreference || []);
          setFitnessGoal(data.fitnessGoal || "");
          setExperienceLevel(data.experienceLevel || "");
          setLimitations(data.limitations || "");
          setWorkoutPreference(data.workoutPreference || "");
          setEquipmentPreference(data.equipmentPreference || []);
          setWorkoutGroupPreference(data.workoutGroupPreference || []);
        }
      } catch (error) {
        console.error("Error loading biometrics:", error);
        Alert.alert("Failed to load saved biometrics.");
      }
    };
  
    loadBiometrics();
  }, []);  

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
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
        <Text style={{ color: "white", fontSize: 25 }}>←</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Your Fitness Profile</Text>

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />

      <Text style={styles.label}>Height (ft'in")</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

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

      <Text style={styles.label}>Preferred Targeted Areas</Text>
      {renderMultiSelectButtons(workoutGroupChoice, workoutGroupPreference, setWorkoutGroupPreference)}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
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
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginTop: theme.spacing.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  disabledButton: {
    backgroundColor: "#888", // or use theme.colors.disabled if defined
  },
  
  submitButtonText: {
    color: "#0D0D0D", // or theme.colors.textDark if defined
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
  },
  
});
