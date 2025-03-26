import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { fetchUserBiometrics, fetchUserGym, fetchUserPreferences } from "../Services/fetchUserData";
import { Preferences } from "../models/preferenceModel";
import { Gym } from "../models/gymInfoModel";
import { Biometric } from "../models/biometricModel";

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
  const [workout, setWorkout] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const generateWorkout = async () => {
    setLoading(true);
    const biometrics = await fetchUserBiometrics();
    const tempPreferences = await fetchUserPreferences();
    const gym = await fetchUserGym();

    if (!biometrics) {
      setWorkout("No biometric data found. Please fill in your biometrics first.");
      setLoading(false);
      return;
    }
    if (!tempPreferences) {
      setWorkout("No preferences data found. Please fill in your preferences first.");
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
      const response = await fetch("http://138.47.138.44:5000/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();
      setWorkout(data.workoutPlan || "Workout generation failed.");
    } catch (error) {
      console.error("Error generating workout:", error);
      setWorkout("Failed to fetch workout plan.");
    }

    setLoading(false);
  };

  useEffect(() => {
    generateWorkout();
  }, []);

  // Function to format the workout text properly
  const formatWorkoutPlan = (workoutText: string) => {
    if (!workoutText) return [];
    
    // Split workout text by double line breaks to separate days
    return workoutText.split("\n\n").map((day, index) => (
      <View key={index} style={styles.workoutCard}>
        <Text style={styles.workoutText}>{day}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your AI-Generated Workout Plan</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {formatWorkoutPlan(workout)}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.button} onPress={generateWorkout}>
        <Text style={styles.buttonText}>REGENERATE WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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

  workoutCard: {
    backgroundColor: "#1E1E2D",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  workoutText: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "85%",
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D0D0D",
  },
});

export default GenerateWorkoutScreen;
