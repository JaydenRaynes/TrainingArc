import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { db } from "../firebaseConfig"; // Import Firestore from your setup
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig"; // Import Firebase Auth to get user ID

const WorkoutPlanScreen = () => {
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{ [key: string]: { split: string; workouts: { name: string; completed: boolean }[] } }>({});
  const [newWorkout, setNewWorkout] = useState<{ [key: string]: string }>({});

  // Load workout plan from Firestore
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setWorkoutPlan(docSnap.data()?.workoutPlans || {});
      }
    };
  
    fetchWorkoutPlan();
  }, []);

  const saveWorkoutPlan = async () => {
    console.log("Saving workout plan:", workoutPlan);
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { workoutPlans: workoutPlan }, { merge: true });
      console.log("Workout plan saved successfully!");
    } catch (error) {
      console.error("Error saving workout plan:", error);
    }
  };
  

  // Update split name
  const updateSplit = (day: string, split: string) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], split, workouts: prev[day]?.workouts || [] },
    }));
  };

  // Add new workout
  const addWorkout = (day: string) => {
    if (!newWorkout[day]) return;
    setWorkoutPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        workouts: [...(prev[day]?.workouts || []), { name: newWorkout[day], completed: false }],
      },
    }));
    setNewWorkout((prev) => ({ ...prev, [day]: "" })); // Clear input field
  };

  // Toggle workout completion
  const toggleWorkoutCompletion = (day: string, index: number) => {
    setWorkoutPlan((prev) => {
      const updatedWorkouts = [...prev[day].workouts];
      updatedWorkouts[index].completed = !updatedWorkouts[index].completed;
      return { ...prev, [day]: { ...prev[day], workouts: updatedWorkouts } };
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
        <View key={day} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{day}</Text>
          <TextInput
            placeholder="Enter split (e.g., Push, Pull, Legs)"
            value={workoutPlan[day]?.split || ""}
            onChangeText={(text) => updateSplit(day, text)}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <FlatList
            data={workoutPlan[day]?.workouts || []}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <BouncyCheckbox
                  isChecked={item.completed}
                  text={item.name}
                  onPress={() => toggleWorkoutCompletion(day, index)}
                />
              </View>
            )}
          />
          <TextInput
            placeholder="Enter workout (e.g., Bench Press)"
            value={newWorkout[day] || ""}
            onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, [day]: text }))}
            style={{ borderBottomWidth: 1, marginBottom: 5 }}
          />
          <Button title="Add Workout" onPress={() => addWorkout(day)} />
        </View>
      ))}
      <Button title="Save Plan" onPress={saveWorkoutPlan} />
    </ScrollView>

  );
};

export default WorkoutPlanScreen;