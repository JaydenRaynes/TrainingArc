import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";

const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your API Key

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

      {workoutPlan ? (
        <>
          <Text style={styles.splitText}>Split: {workoutPlan.split}</Text>
          <FlatList
            data={workoutPlan.workouts}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.workoutItem}>
                <BouncyCheckbox
                  isChecked={item.completed}
                  text={`${item.name} - ${item.sets}x${item.reps} @ ${item.weight} lbs`}
                  textStyle={styles.checkboxText}
                  fillColor={theme.colors.primary}
                  onPress={() => toggleWorkoutCompletion(index)}
                />
              </View>
            )}
          />
          <Button title="Save Completed Workouts" onPress={() => saveToProgress(workoutPlan.workouts)} color={theme.colors.primary} />
        </>
      ) : (
        <Text style={styles.noWorkoutText}>No workout planned for today.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
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
