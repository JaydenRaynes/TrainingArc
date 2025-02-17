import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";

const WorkoutsPage = () => {
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    const currentDay = format(new Date(), "EEEE"); // Get the current day (e.g., "Monday")
    setToday(currentDay);

    if (!userID) return;

    // Listen for real-time updates on the workout plan
    const userRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.workoutPlans && data.workoutPlans[currentDay]) {
          setWorkoutPlan(data.workoutPlans[currentDay]); // Load today's workout
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [userID]);

  // Function to save completed workouts to the "progress" collection
  const saveToProgress = async (completedWorkouts) => {
    if (!completedWorkouts || completedWorkouts.length === 0) return;
  
    const userID = auth.currentUser?.uid;
    if (!userID) return;
  
    const progressRef = doc(db, "users", userID, "progress", format(new Date(), "yyyy-MM-dd"));
  
    // Construct the progress data for that day
    const progressData = {
      date: format(new Date(), "yyyy-MM-dd"),
      workouts: completedWorkouts.map(workout => ({
        workoutName: workout.name,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        completed: workout.completed,
      }))
    };
  
    try {
      // Check if the document already exists
      const docSnap = await getDoc(progressRef);
  
      if (docSnap.exists()) {
        // If the document exists, update the workouts array with the new completed workouts
        await updateDoc(progressRef, {
          workouts: arrayUnion(...progressData.workouts),
        });
        console.log("Progress updated successfully!");
      } else {
        // If the document doesn't exist, create a new one
        await setDoc(progressRef, progressData);
        console.log("Progress saved successfully!");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Toggle workout completion and update Firestore
  const toggleWorkoutCompletion = async (index: number) => {
    if (!userID || !workoutPlan) return;

    const updatedWorkouts = [...workoutPlan.workouts];
    updatedWorkouts[index].completed = !updatedWorkouts[index].completed;

    // Update Firestore workout plan with completion status
    const userRef = doc(db, "users", userID);
    await updateDoc(userRef, {
      [`workoutPlans.${today}.workouts`]: updatedWorkouts,
    });

    setWorkoutPlan({ ...workoutPlan, workouts: updatedWorkouts });
  };

  // Handle save button click to store completed workouts
  const handleSaveCompletedWorkouts = () => {
    if (!workoutPlan) return;
  
    const completedWorkouts = workoutPlan.workouts.filter((workout) => workout.completed);
    if (completedWorkouts.length === 0) {
      Alert.alert("No Completed Workouts", "Please check off some workouts before saving.");
    } else {
      saveToProgress(completedWorkouts); // Now saves all completed workouts for the day under one document
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>{today}'s Workout</Text>
      {workoutPlan ? (
        <>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>Split: {workoutPlan.split}</Text>
          <FlatList
            data={workoutPlan.workouts}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <BouncyCheckbox
                  isChecked={item.completed}
                  text={`${item.name} - ${item.sets}x${item.reps} @ ${item.weight} lbs`}
                  onPress={() => toggleWorkoutCompletion(index)}
                />
              </View>
            )}
          />
          <Button title="Save Completed Workouts" onPress={handleSaveCompletedWorkouts} />
        </>
      ) : (
        <Text>No workout planned for today.</Text>
      )}
    </View>
  );
};

export default WorkoutsPage;
