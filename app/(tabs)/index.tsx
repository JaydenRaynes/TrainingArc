import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Replace with your API Key

const WorkoutsPage = () => {
  const router = useRouter();
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);

  const [today, setToday] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [calendarVisible, setCalendarVisible] = useState(false);
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
    fetchWorkoutData(selectedDate);
  }, [userID, selectedDate]);

  const fetchWorkoutData = (date: string) => {
    if (!userID) return;

    const userRef = doc(db, "users", userID);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const formattedDay = format(new Date(date), "EEEE");
        if (data.workoutPlans && data.workoutPlans[formattedDay]) {
          setWorkoutPlan(data.workoutPlans[formattedDay]);
        } else {
          setWorkoutPlan(null);
        }
      } else {
        setWorkoutPlan(null);
      }
    });

    return () => unsubscribe();
  };

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

  const saveToProgress = async (completedWorkouts: any) => {
    if (!completedWorkouts || completedWorkouts.length === 0) return;
    if (!userID) return;

    const progressRef = doc(db, "users", userID, "progress", selectedDate);

    const progressData = {
      date: selectedDate,
      workouts: completedWorkouts.map((workout: any) => ({
        workoutName: workout.name,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        completed: workout.completed,
      })),
    };

    try {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        await updateDoc(progressRef, { workouts: arrayUnion(...progressData.workouts) });
      } else {
        await setDoc(progressRef, progressData);
      }
      Alert.alert("Success", "Workouts saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

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
    <View style={styles.container}>
      <Text style={styles.headerText}>{today}'s Workout</Text>

      {/* Button to open calendar */}
      <TouchableOpacity style={styles.calendarButton} onPress={() => setCalendarVisible(true)}>
        <Text style={styles.calendarButtonText}>Pick a Date</Text>
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
                fetchWorkoutData(day.dateString);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
              }}
              theme={{
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
                textDayFontSize: theme.fontSize.medium,
                textMonthFontSize: theme.fontSize.large,
                textDayHeaderFontSize: theme.fontSize.small,
              }}
            />
            <Button title="Close" onPress={() => setCalendarVisible(false)} color={theme.colors.secondary} />
          </View>
        </View>
      </Modal>

      <FlatList
        data={workoutPlan?.workouts || []}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.workoutItem}>
            <BouncyCheckbox
              isChecked={item.completed}
              text={`${item.name} - ${item.sets}x${item.reps} @ ${item.weight} lbs`}
              onPress={() => toggleWorkoutCompletion(index)}
            />
            <View style={styles.buttonsContainer}>
              <View style={{ flex: 1, marginRight: 5 }}>
                  <Button title="⏱ Timer" onPress={() => openTimerModal(item.name)} />
              </View>
              <View style={{ flex: 1, marginLeft: 5 }}>
                <Button title="🔥 Calories" onPress={() => fetchCaloriesBurned(item.name)} />
              </View>
            </View>
            {loadingCalories[item.name] ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              caloriesBurned[item.name] && <Text>🔥 {caloriesBurned[item.name].toFixed(2)} kcal</Text>
            )}
          </View>
        )}
      />

      {/* Timer Modal */}
      <Modal visible={timerModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>{activeWorkout} Timer: {timer}s</Text>
            <Button title="Start" onPress={startTimer} />
            <Button title="Stop" onPress={stopTimer} />
            <Button title="Reset" onPress={resetTimer} />
            <Button title="Close" onPress={() => setTimerModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Button title="Save Completed Workouts" onPress={saveToProgress} color={theme.colors.primary}/>
      <Button title="Edit Splits page" onPress={() => router.push("/component/splits")} color={theme.colors.secondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly", // Ensures even spacing
    alignItems: "center",
    marginTop: theme.spacing.small,
    width: "100%", // Ensures buttons span full width
    flexWrap: "wrap", // Allows wrapping in case of space issues
  },  
  headerText: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    textAlign: "center",
  },
  calendarButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  calendarButtonText: {
    color: theme.colors.buttonText,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
  splitText: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  workoutItem: {
    flexDirection: "column",
    backgroundColor: theme.colors.cardBackground || "#fff",
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexShrink: 1, // Prevents hidden content
    minHeight: 100, // Ensures item doesn't collapse
  },
    
  checkboxText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
  noWorkoutText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.danger,
    textAlign: "center",
    marginTop: theme.spacing.large,
  },
});

export default WorkoutsPage;
