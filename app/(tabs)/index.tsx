import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";
import WorkoutChatbot from "../component/WorkoutChatbot";

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Replace with your API Key

const WorkoutsPage = () => {
  const router = useRouter();
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);

  const [displayedDay, setDisplayedDay] = useState<string>("");
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
    const selectedDayName = format(new Date(selectedDate), "EEEE");
    setDisplayedDay(selectedDayName);
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

    const dayKey = format(new Date(selectedDate), "EEEE");

    const userRef = doc(db, "users", userID);
    await updateDoc(userRef, {
      [`workoutPlans.${dayKey}.workouts`]: updatedWorkouts,
    });

    setWorkoutPlan({ ...workoutPlan, workouts: updatedWorkouts });
  };

  const saveToProgress = async () => {
    if (!userID || !workoutPlan) return;
  
    const completedWorkouts = workoutPlan.workouts.filter((w) => w.completed);
    if (completedWorkouts.length === 0) {
      Alert.alert("⚠️ Nothing to Save", "Please complete at least one workout first.");
      return;
    }
  
    const progressRef = doc(db, "users", userID, "progress", selectedDate);
  
    const progressData = {
      date: selectedDate,
      workouts: completedWorkouts.map((workout) => ({
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
        await updateDoc(progressRef, {
          workouts: arrayUnion(...progressData.workouts),
        });
      } else {
        await setDoc(progressRef, progressData);
      }
  
      Alert.alert(" Completed", "Workout saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      Alert.alert(" Error", "Failed to save workout.");
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
      <Text style={styles.headerText}>{displayedDay}'s Workout</Text>

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
              calendarBackground: theme.colors.cardBackground,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.blackText,
              todayTextColor: theme.colors.warning,
              dayTextColor: theme.colors.text,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.primary,
              textDisabledColor: "#555",
              textDayFontSize: theme.fontSize.medium,
              textMonthFontSize: theme.fontSize.large,
              textDayHeaderFontSize: theme.fontSize.small,
            }}
          />
          <TouchableOpacity
            onPress={() => setCalendarVisible(false)}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: theme.spacing.small,
              paddingHorizontal: theme.spacing.large,
              borderRadius: theme.borderRadius.small,
              marginTop: theme.spacing.medium,
            }}
          >
            <Text style={{ color: theme.colors.buttonText, fontWeight: "bold", fontSize: theme.fontSize.medium }}>
              Close
            </Text>
          </TouchableOpacity>
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
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => openTimerModal(item.name)}
              >
                <Text style={styles.actionButtonText}>⏱ Timer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.primary, borderWidth: 1 }]}
                onPress={() => fetchCaloriesBurned(item.name)}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>🔥 Calories</Text>
              </TouchableOpacity>
            </View>
            {loadingCalories[item.name] ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 8 }} />
            ) : caloriesBurned[item.name] ? (
              <Text style={styles.calorieText}>
                🔥 {caloriesBurned[item.name].toFixed(2)} kcal
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* Timer Modal */}
      <Modal visible={timerModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <Text style={styles.timerTitle}>{activeWorkout} Timer</Text>
          <Text style={styles.timerDisplay}>{timer}s</Text>
          <View style={styles.timerButtonsContainer}>
            <TouchableOpacity style={[styles.timerButton, { backgroundColor: theme.colors.primary }]} onPress={startTimer}>
              <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>

            <TouchableOpacity style={[styles.timerButton, { backgroundColor: "gray" }]} onPress={stopTimer}>
              <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>

            <TouchableOpacity style={[styles.timerButton, { backgroundColor: "red" }]} onPress={resetTimer}>
              <Text style={styles.buttonText}>Stop/Reset</Text>
              </TouchableOpacity>

            <TouchableOpacity style={[styles.timerButton, { backgroundColor: theme.colors.secondary }]} onPress={() => setTimerModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.saveButton} onPress={saveToProgress}>
        <Text style={styles.saveButtonText}> Save Completed Workouts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={() => router.push("/component/splits")}>
        <Text style={styles.editButtonText}> Edit Splits Page</Text>
      </TouchableOpacity>
      <WorkoutChatbot />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center",     // centers horizontally
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent backdrop
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground || "#fff",
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center", // center content inside
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    width: "90%",
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
  timerTitle: {
  fontSize: 22,
  fontWeight: "600",
  marginBottom: 10,
  color: theme.colors.primary,
  textAlign: "center",
},

timerDisplay: {
  fontSize: 48,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 20,
},
timerButtonsContainer: {
  width: "100%",
  marginTop: 20,
  alignItems: "center",
  gap: 12,
},

timerButton: {
  width: "80%",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},

buttonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
},
actionButton: {
  paddingVertical: theme.spacing.small,
  paddingHorizontal: theme.spacing.medium,
  borderRadius: theme.borderRadius.small,
  marginHorizontal: 5,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 100,
},

actionButtonText: {
  color: theme.colors.buttonText,
  fontSize: theme.fontSize.medium,
  fontWeight: "bold",
},
calorieText: {
  color: theme.colors.textSecondary,
  fontSize: theme.fontSize.medium,
  marginTop: 8,
  fontWeight: "500",
  textAlign: "center",
},
saveButton: {
  backgroundColor: theme.colors.primary,
  paddingVertical: theme.spacing.medium,
  borderRadius: theme.borderRadius.medium,
  alignItems: "center",
  marginTop: theme.spacing.large,
},

saveButtonText: {
  color: theme.colors.buttonText,
  fontSize: theme.fontSize.medium,
  fontWeight: "bold",
},
editButton: {
  backgroundColor: theme.colors.secondary,
  paddingVertical: theme.spacing.medium,
  borderRadius: theme.borderRadius.medium,
  alignItems: "center",
  marginTop: theme.spacing.small,
},
editButtonText: {
  color: theme.colors.buttonText,
  fontSize: theme.fontSize.medium,
  fontWeight: "bold",
  color: theme.colors.text,
},
});

export default WorkoutsPage;
