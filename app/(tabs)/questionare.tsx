import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from "react-native";

const WorkoutQuestionnaire = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workoutDays, setWorkoutDays] = useState("");

  const handleSubmit = () => {
    if (!name || !age || !fitnessGoal || !experienceLevel || !workoutDays) {
      Alert.alert("Please fill out all fields");
      return;
    }
    Alert.alert("Questionnaire Submitted", `Thanks, ${name}! We'll customize a workout for you.`);
    // Here you can add further logic, such as saving data to a backend
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Workout Questionnaire</Text>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.label}>What is your fitness goal?</Text>
      <TextInput
        style={styles.input}
        placeholder="E.g., Build muscle, Lose weight"
        value={fitnessGoal}
        onChangeText={setFitnessGoal}
      />

      <Text style={styles.label}>Experience Level:</Text>
      <TextInput
        style={styles.input}
        placeholder="Beginner, Intermediate, Advanced"
        value={experienceLevel}
        onChangeText={setExperienceLevel}
      />

      <Text style={styles.label}>How many days per week can you work out?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of days"
        keyboardType="numeric"
        value={workoutDays}
        onChangeText={setWorkoutDays}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default WorkoutQuestionnaire;
