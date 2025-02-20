import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { fetchUserBiometrics } from "../services/fetchUserBiometrics";

const GenerateWorkoutScreen: React.FC = () => {
  const [workout, setWorkout] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const generateWorkout = async () => {
    setLoading(true);
    const biometrics = await fetchUserBiometrics();

    if (!biometrics) {
      setWorkout("No biometric data found. Please fill in your biometrics first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://192.168.1.207:5000/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(biometrics),
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
