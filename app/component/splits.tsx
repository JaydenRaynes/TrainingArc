import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Stack } from "expo-router";
import {theme} from "../utils/theme";

const WorkoutPlanScreen = () => {
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [newWorkout, setNewWorkout] = useState({});

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!userID) return;
      const userRef = doc(db, "users", userID);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setWorkoutPlan(docSnap.data()?.workoutPlans || {});
      }
    };
    fetchWorkoutPlan();
  }, [userID]);

  const saveWorkoutPlan = async () => {
    if (!userID) return;
    try {
      const userRef = doc(db, "users", userID);
      await setDoc(userRef, { workoutPlans: workoutPlan }, { merge: true });
      console.log("Workout plan saved!");
    } catch (error) {
      console.error("Error saving workout plan:", error);
    }
  };

  const updateSplit = (day, split) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], split, workouts: prev[day]?.workouts || [] },
    }));
  };

  const addWorkout = (day) => {
    if (!newWorkout[day]?.name) return;
    setWorkoutPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        workouts: [...(prev[day]?.workouts || []), { ...newWorkout[day], completed: false }],
      },
    }));
    setNewWorkout((prev) => ({ ...prev, [day]: { name: "", sets: "", reps: "", weight: "" } }));
  };

  const deleteWorkout = (day, index) => {
    setWorkoutPlan((prev) => {
      const updatedWorkouts = prev[day].workouts.filter((_, i) => i !== index);
      return { ...prev, [day]: { ...prev[day], workouts: updatedWorkouts } };
    });
  };

  return (
    <View style={styles.container}>  
      <Stack.Screen options={{ title: "Splits", headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: "#FFF" }} />  

      <FlatList
        data={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
        keyExtractor={(item) => item}
        renderItem={({ item: day }) => (
          <View style={styles.dayContainer}>  
            <Text style={styles.dayText}>{day}</Text>  
            <TextInput
              placeholder="Enter split (e.g., Push, Pull)"
              value={workoutPlan[day]?.split || ""}
              onChangeText={(text) => updateSplit(day, text)}
              style={styles.input}  
              placeholderTextColor={theme.colors.placeholder}  
            />

            <FlatList
              data={workoutPlan[day]?.workouts || []}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.workoutItem}>  
                  <Text style={styles.workoutText}>
                    {item.name} - {item.sets} sets x {item.reps} reps @ {item.weight} lbs
                  </Text>
                  <TouchableOpacity onPress={() => deleteWorkout(day, index)}>
                    <Text style={styles.deleteText}>Delete</Text>  
                  </TouchableOpacity>
                </View>
              )}
            />

            <TextInput
              placeholder="Workout Name"
              value={newWorkout[day]?.name || ""}
              onChangeText={(text) =>
                setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], name: text } }))
              }
              style={styles.input}  
              placeholderTextColor={theme.colors.placeholder}  
            />
            <TextInput
              placeholder="Sets"
              value={newWorkout[day]?.sets || ""}
              onChangeText={(text) =>
                setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], sets: text } }))
              }
              style={styles.input}  
              placeholderTextColor={theme.colors.placeholder}  
            />
            <TextInput
              placeholder="Reps"
              value={newWorkout[day]?.reps || ""}
              onChangeText={(text) =>
                setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], reps: text } }))
              }
              style={styles.input}  
              placeholderTextColor={theme.colors.placeholder}  
            />
            <TextInput
              placeholder="Weight"
              value={newWorkout[day]?.weight || ""}
              onChangeText={(text) =>
                setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], weight: text } }))
              }
              style={styles.input}  
              placeholderTextColor={theme.colors.placeholder}  
            />
            <Button title="Add Workout" onPress={() => addWorkout(day)} color={theme.colors.primary} />  
          </View>
        )}
      />
      <Button title="Save Plan" onPress={saveWorkoutPlan} color={theme.colors.secondary} />  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.medium, 
  },
  dayContainer: {
    marginBottom: theme.spacing.large, 
    padding: theme.spacing.medium,
    backgroundColor: "#FFF",
    borderRadius: theme.borderRadius.small, 
    shadowColor: theme.colors.shadow, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: theme.fontSize.large, 
    fontWeight: "bold",
    color: theme.colors.primary, 
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border, 
    marginBottom: theme.spacing.small, 
    fontSize: theme.fontSize.medium, 
    color: theme.colors.blackText, 
  },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small, 
  },
  workoutText: {
    color: theme.colors.blackText,  
  },
  deleteText: {
    color: theme.colors.danger,  
    marginLeft: 10,
  },
});

export default WorkoutPlanScreen;