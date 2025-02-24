import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Your API Key

const WorkoutsPage = () => {
  const router = useRouter();
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [today, setToday] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd")); // Stores selected date
  const [calendarVisible, setCalendarVisible] = useState(false); // Controls calendar visibility

  useEffect(() => {
    const currentDay = format(new Date(), "EEEE"); // Get the current day (e.g., "Monday")
    setToday(currentDay);
    fetchWorkoutData(selectedDate);
  }, [userID, selectedDate]);

  const fetchWorkoutData = (date) => {
    if (!userID) return;
    const userRef = doc(db, "users", userID);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const formattedDay = format(new Date(date), "EEEE"); // Convert date to weekday name
        if (data.workoutPlans && data.workoutPlans[formattedDay]) {
          setWorkoutPlan(data.workoutPlans[formattedDay]); // Load workouts for selected date
        } else {
          setWorkoutPlan(null);
        }
      }
    });

    return () => unsubscribe();
  };

  const saveToProgress = async (completedWorkouts) => {
    if (!completedWorkouts || completedWorkouts.length === 0) return;
    if (!userID) return;

    const progressRef = doc(db, "users", userID, "progress", selectedDate);

    const progressData = {
      date: selectedDate,
      workouts: completedWorkouts.map(workout => ({
        workoutName: workout.name,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        completed: workout.completed,
      }))
    };

    try {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        await updateDoc(progressRef, { workouts: arrayUnion(...progressData.workouts) });
      } else {
        await setDoc(progressRef, progressData);
      }
      console.log("Progress saved!");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const toggleWorkoutCompletion = async (index) => {
    if (!userID || !workoutPlan) return;

    const updatedWorkouts = [...workoutPlan.workouts];
    updatedWorkouts[index].completed = !updatedWorkouts[index].completed;

    const userRef = doc(db, "users", userID);
    await updateDoc(userRef, {
      [`workoutPlans.${today}.workouts`]: updatedWorkouts,
    });

    setWorkoutPlan({ ...workoutPlan, workouts: updatedWorkouts });
  };

  const handleSaveCompletedWorkouts = () => {
    if (!workoutPlan) return;
    const completedWorkouts = workoutPlan.workouts.filter((workout) => workout.completed);
    if (completedWorkouts.length === 0) {
      Alert.alert("No Completed Workouts", "Please check off some workouts before saving.");
    } else {
      saveToProgress(completedWorkouts);
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
          <Button title="Save Completed Workouts" onPress={handleSaveCompletedWorkouts} color={theme.colors.primary} />
        </>
      ) : (
        <Text style={styles.noWorkoutText}>No workout planned for today.</Text>
      )}

      <Button title="Edit Splits Plans" onPress={() => router.push("/component/splits")} color={theme.colors.secondary} />
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    width: "90%",
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
