import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Button,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Your API Key

const WorkoutsPage = () => {
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);
  const [today, setToday] = useState<string>("");
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState<{ [key: string]: number }>({});
  const [loadingCalories, setLoadingCalories] = useState<{ [key: string]: boolean }>({});
  const [workoutDurations, setWorkoutDurations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const currentDay = format(new Date(), "EEEE");
    setToday(currentDay);

    if (!userID) return;

    const userRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.workoutPlans && data.workoutPlans[currentDay]) {
          setWorkoutPlan(data.workoutPlans[currentDay]); // Load today's workout
        }
      }
    });

    return () => unsubscribe();
  }, [userID]);

  // Toggle workout completion and update Firestore
  const toggleWorkoutCompletion = async (index: number) => {
    if (!userID || !workoutPlan) return;

    const updatedWorkouts = [...workoutPlan.workouts];
    updatedWorkouts[index].completed = !updatedWorkouts[index].completed;

    const userRef = doc(db, "users", userID);
    await updateDoc(userRef, {
      [`workoutPlans.${today}.workouts`]: updatedWorkouts,
    });

    setWorkoutPlan({ ...workoutPlan, workouts: updatedWorkouts });
  };

  // Save completed workouts to Firestore
  const handleSaveCompletedWorkouts = async () => {
    if (!workoutPlan) return;

    const completedWorkouts = workoutPlan.workouts.filter((workout) => workout.completed);
    if (completedWorkouts.length === 0) {
      Alert.alert("No Completed Workouts", "Please check off some workouts before saving.");
      return;
    }

    const progressRef = doc(db, "users", userID!, "progress", format(new Date(), "yyyy-MM-dd"));

    try {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        await updateDoc(progressRef, {
          workouts: arrayUnion(...completedWorkouts),
        });
      } else {
        await setDoc(progressRef, { date: format(new Date(), "yyyy-MM-dd"), workouts: completedWorkouts });
      }
      Alert.alert("Success", "Workouts saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Handle timer modal
  const openTimerModal = (workoutName: string) => {
    setActiveWorkout(workoutName);
    setTimer(0);
    setTimerRunning(false);
    setTimerModalVisible(true);
  };

  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    if (activeWorkout) {
      setWorkoutDurations((prev) => {
        const updatedDurations = { ...prev, [activeWorkout]: timer };
        console.log("Saved duration:", updatedDurations); // DEBUG: Check saved times
        return updatedDurations;
      });
    }
  };

  const resetTimer = () => {
    setTimer(0);
    setTimerRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Fetch Calories Burned
  const fetchCaloriesBurned = async (exercise: string) => {
    let durationInMinutes = Math.max(Math.ceil((workoutDurations[exercise] || 0) / 60), 1); // Ensure at least 1 min
    console.log(`Fetching calories for ${exercise} - Duration: ${durationInMinutes} min`);
  
    setLoadingCalories((prev) => ({ ...prev, [exercise]: true }));
  
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(
          exercise
        )}&duration=${durationInMinutes}`,
        {
          method: "GET",
          headers: { "X-Api-Key": API_KEY },
        }
      );
  
      const data = await response.json();
      console.log("API Response:", data); // DEBUG: Check API response
  
      if (data.length > 0) {
        setCaloriesBurned((prev) => ({
          ...prev,
          [exercise]: data[0].calories_per_hour * (durationInMinutes / 60),
        }));
      } else {
        Alert.alert("Error", "No data found for this exercise.");
      }
    } catch (error) {
      console.error("API Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch calories burned.");
    }
  
    setLoadingCalories((prev) => ({ ...prev, [exercise]: false }));
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
              <View style={{ marginBottom: 10 }}>
                <BouncyCheckbox
                  isChecked={item.completed}
                  text={`${item.name} - ${item.sets}x${item.reps} @ ${item.weight} lbs`}
                  onPress={() => toggleWorkoutCompletion(index)}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                  <Button title="⏱ Timer" onPress={() => openTimerModal(item.name)} />
                  <Button title="🔥 Calories" onPress={() => fetchCaloriesBurned(item.name)} />
                </View>
                {loadingCalories[item.name] ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  caloriesBurned[item.name] && (
                    <Text>🔥 {caloriesBurned[item.name] ? `${caloriesBurned[item.name].toFixed(2)} calories` : "Calculating..."}</Text>

                  )
                )}
              </View>
            )}
          />
          <Button title="Save Completed Workouts" onPress={handleSaveCompletedWorkouts} />
        </>
      ) : (
        <Text>No workout planned for today.</Text>
      )}

      {/* Timer Modal */}
      <Modal visible={timerModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 20 }}>{activeWorkout} Timer: {timer}s</Text>
            <Button title="Start" onPress={startTimer} />
            <Button title="Stop" onPress={stopTimer} />
            <Button title="Reset" onPress={resetTimer} />
            <Button title="Close" onPress={() => setTimerModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorkoutsPage;
