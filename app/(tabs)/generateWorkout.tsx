import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { fetchUserBiometrics, fetchUserGym, fetchUserPreferences } from "../services/fetchUserData";
import { Preferences } from "../models/preferenceModel";
import { Gym } from "../models/gymInfoModel";
import { Biometric } from "../models/biometricModel";
import { Split, WorkoutDay } from "../models/splitModel";
import { Exercise } from "../models/exerciseModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

type UserData = Preferences & Biometric & Gym;

const normalizePreferences = (preferences: Preferences): Preferences => {
  return {
    ...preferences,
    activityLevel: {
      active: preferences.activityLevel?.active || false,
      notActive: preferences.activityLevel?.notActive || false,
      slightlyActive: preferences.activityLevel?.slightlyActive || false,
    },
    cardioPreferences: {
      cycling: preferences.cardioPreferences?.cycling || false,
      rowing: preferences.cardioPreferences?.rowing || false,
      running: preferences.cardioPreferences?.running || false,
      swimming: preferences.cardioPreferences?.swimming || false,
      walking: preferences.cardioPreferences?.walking || false,
    },
    equipmentPreference: {
      barbells: preferences.equipmentPreference?.barbells || false,
      dumbbells: preferences.equipmentPreference?.dumbbells || false,
      kettlebells: preferences.equipmentPreference?.kettlebells || false,
      none: preferences.equipmentPreference?.none || false,
      resistanceBands: preferences.equipmentPreference?.resistanceBands || false,
    },
    preferredWorkoutType: {
      bodyweight: preferences.preferredWorkoutType?.bodyweight || false,
      cardio: preferences.preferredWorkoutType?.cardio || false,
      hiit: preferences.preferredWorkoutType?.hiit || false,
      strength: preferences.preferredWorkoutType?.strength || false,
      yoga: preferences.preferredWorkoutType?.yoga || false,
    },
    timeOfDayPreference: {
      morning: preferences.timeOfDayPreference?.morning || false,
      afternoon: preferences.timeOfDayPreference?.afternoon || false,
      evening: preferences.timeOfDayPreference?.evening || false,
      night: preferences.timeOfDayPreference?.night || false,
      any: preferences.timeOfDayPreference?.any || false,
    },
    workoutEnvironment: {
      gym: preferences.workoutEnvironment?.gym || false,
      home: preferences.workoutEnvironment?.home || false,
      outdoor: preferences.workoutEnvironment?.outdoor || false,
    },
    workoutSplit: {
      fullBody: preferences.workoutSplit?.fullBody || false,
      targeted: preferences.workoutSplit?.targeted || false,
      weeklySplit: preferences.workoutSplit?.weeklySplit || false,
    },
  };
};

const GenerateWorkoutScreen: React.FC = () => {
  const [workout, setWorkout] = useState<Split | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateWorkout = async () => {
    setLoading(true);
    const biometrics = await fetchUserBiometrics();
    const tempPreferences = await fetchUserPreferences();
    const gym = await fetchUserGym();

    if (!biometrics) {
      setWorkout(null);
      setLoading(false);
      return;
    }
    if (!tempPreferences) {
      setWorkout(null);
      setLoading(false);
      return;
    }


    // Normalize preferences to ensure all expected fields exist
    const preferences = normalizePreferences(tempPreferences);

    const defaultGym: Gym = {
      name: ["none"],
      geometry: { location: { latitude: 0, longitude: 0 } },
      types: ["none"],
      vicinity: "none",
      place_id: "",
      equipment: [],
    };

    const userInfo: UserData = {
      ...preferences,
      ...biometrics,
      ...(gym || defaultGym),
    };

    try {
      const response = await fetch("http://192.168.0.109:5000/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();
      //console.log(data);
      const reformattedData = data.workoutPlan.replace(/^```json|```/g, '').replace(/\s*```$/g, '').trim();
      const workoutPlan: Split = JSON.parse(reformattedData);

      //console.log(workoutPlan);
      setWorkout(workoutPlan || null);

    } catch (error) {
      console.error("Error generating workout:", error);
      setWorkout(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    generateWorkout();
  }, []);

  const renderEditableWorkout = () => {
    if (!workout) return <Text>No workout plan available.</Text>;
  
    return (
      Array.isArray(workout.days) && workout.days.length > 0 ? (
        workout.days.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.workoutDay}>
            <Text style={styles.dayTitle}>{day.day}</Text>
  
            {/* Check if day.exercises is an array before mapping */}
            {Array.isArray(day.exercises) && day.exercises.length > 0 ? (
              day.exercises.map((exercise, exIndex) => (
                <View key={exIndex} style={styles.exerciseContainer}>
                  <TextInput
                    style={styles.exerciseName}
                    value={exercise.name}
                    onChangeText={(text) => updateExerciseField(dayIndex, exIndex, "name", text)}
                  />
                  <View style={styles.muscleInputContainer}>
                    <Text style={styles.muscleLabel}>Muscle Group: </Text>
                    <TextInput
                      style={styles.muscleInfo}
                      value={exercise.muscle}
                      onChangeText={(text) => updateExerciseField(dayIndex, exIndex, "muscle", text)}
                    />
                  </View>
                  <View style={styles.equipmentInputContainer}>
                    <Text style={styles.equipmentLabel}>Equipment: </Text>
                    <TextInput
                      style={styles.equipmentInfo}
                      value={exercise.equipment}
                      onChangeText={(text) => updateExerciseField(dayIndex, exIndex, "equipment", text)}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text>No exercises available for this day</Text> // Optional fallback if exercises are empty
            )}
          </View>
        ))
      ) : (
        <Text>No workout days available</Text> // Fallback if workout.days is empty or not an array
      )
    );
  };
  
  
  const updateExerciseField = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
  
      const updatedWorkout = { ...prevWorkout };
      updatedWorkout.days[dayIndex].exercises[exIndex][field] = value;
  
      return updatedWorkout;
    });
  };

  const handleSaveWorkoutPlan = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid, 'workout', 'currentWorkout');
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.log("Workout does not exist, creating...");
      } else {
        console.log("Workout already exists, updating...");
      }

      await setDoc(userRef, {
        workout
      });

      Alert.alert('Success', 'Workout saved!');
    } catch (error) {
      console.error('Error saving workout to Firestore:', error);
      Alert.alert('Error', 'Failed to save workout.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your AI-Generated Workout Plan</Text>
  
      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {renderEditableWorkout()}
        </ScrollView>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.genButton} onPress={generateWorkout}>
          <Text style={styles.buttonText}>Regenerate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkoutPlan}>
          <Text style={styles.buttonText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F9FA",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 10,
    textAlign: "center",
  },

  scrollContainer: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },

  workoutDay: {
    backgroundColor: "#2C2C38",
    padding: 15,
    borderRadius: 12,
    width: "95%",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 8,
    textAlign: "center",
  },

  exerciseContainer: {
    backgroundColor: "#1E1E2D",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  input: {
    backgroundColor: "#333344",
    color: "#FFF",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 8,
  },

  exerciseName: {
    fontSize: 18,  // Make the exercise name larger
    fontWeight: 'bold',  // Makes it bold to stand out
    color: '#666',  // Set a color that contrasts with the rest
  },
  muscleInfo: {
    fontSize: 14,  // Slightly smaller font size for muscle
    color: 'white',  // A lighter color to make it less prominent
  },
  equipmentInfo: {
    fontSize: 14,  // Same size as muscle info
    color: 'white',  // A lighter color for equipment info
  },

  buttonContainer: {
    flexDirection: 'row', // This arranges buttons in a row (side by side)
    justifyContent: 'space-between', // Space out buttons
    alignItems: 'center',
    marginTop: 2,  // Add some margin at the top
    marginBottom: 5,
    bottom: 60,
    zIndex: 1000,
  },
  genButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    width: "45%",
    alignItems: "center",
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: 'white',  // Button text color
    fontSize: 19,  // Text size
    fontWeight: 'bold',  // Bold text for prominence
  },
  muscleLabel: {
    fontWeight: "bold", // Make the label stand out
    fontSize: 14,
    color: 'white',
  },
  equipmentLabel: {
    fontWeight: "bold", // Make the label stand out
    fontSize: 14,
    color: 'white'
  },
  muscleInputContainer: {
    flexDirection: "row", // Arrange label and input side by side
    alignItems: "center", // Align them vertically
  },
  equipmentInputContainer: {
    flexDirection: "row", // Arrange label and input side by side
    alignItems: "center", // Align them vertically
  },
});


export default GenerateWorkoutScreen;
