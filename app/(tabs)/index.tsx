import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
import { addDays, format, parse } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";
import WorkoutChatbot from "../component/WorkoutChatbot";
import { SavedSplit } from "../models/savedWorkoutModel";
import { Split, WorkoutDay } from "../models/splitModel";

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Replace with your API Key

const WorkoutsPage = () => {
  const router = useRouter();
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);

  const [today, setToday] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "mm-dd-yyyy"));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState<{ [key: string]: number }>({});
  const [loadingCalories, setLoadingCalories] = useState<{ [key: string]: boolean }>({});
  const [workoutDurations, setWorkoutDurations] = useState<{ [key: string]: number }>({});
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean }>({});
  const [activeRatingSet, setActiveRatingSet] = useState<string | null>(null);
  const [setRatings, setSetRatings] = useState<{ [key: string]: number }>({});
  const [isSavedWorkoutModalVisible, setSavedWorkoutModalVisible] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [savedSplits, setSavedSplits] = useState<SavedSplit[]>([]);


  useEffect(() => {
    const currentDay = format(new Date(), "EEEE");
    setToday(currentDay);
    fetchWorkoutData(selectedDate);
    fetchSavedSplits();
  }, [userID, selectedDate]);

  const fetchSavedSplits = async () => {
    if (!userID) return;
    const userRef = doc(db, "users", userID, 'savedWorkouts', 'workouts');
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const splitsArray = data.workouts as SavedSplit[];
      //console.log("fetched saved splits: ", splitsArray);
      setSavedSplits(splitsArray);
    }
  };

  const fetchWorkoutData = (date: string) => {
    if (!userID) return;
  
    const userRef = doc(db, "users", userID, 'workout', 'currentWorkout');
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        //const dayKey = getDayKey(date); // e.g. "Day 1"
        const [year, month, day] = date.split('-');
        const formattedDate = `${month}-${day}-${year}`;
        const workoutDays = data.workout?.days || [];
        const matchedDay = workoutDays.find((d: any) => d.day === formattedDate);
        if (matchedDay) {
          setWorkoutPlan({
            split: formattedDate,
            workouts: matchedDay.exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              completed: false,
            })),
          });
        } else {
          setWorkoutPlan(null);
        }
      } else {
        setWorkoutPlan(null);
      }
    });
  
    return () => unsubscribe();
  };

  const setNewWorkout = async (presetSplit: SavedSplit) => {
    if (!userID) return;
  
    try {
      const userRefCurrWorkout = doc(db, "users", userID, "workout", "currentWorkout");
  
      const docSnap = await getDoc(userRefCurrWorkout);
      const newSplit: Split = presetSplit.split;
  
      let existingDays: WorkoutDay[] = [];
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        existingDays = data?.workout?.days || [];
      }
  
      const updatedDays = [...existingDays, ...newSplit.days];
  
      await setDoc(userRefCurrWorkout, {
        workout: { days: updatedDays }
      }, { merge: true });
  
      console.log("New workout added successfully!");
    } catch (error) {
      console.error("Error adding new workout:", error);
    }
  };
  
  
  

  const adjustWorkoutBasedOnRatings = (plan: typeof workoutPlan | null) => {
    if (!plan) return plan;
  
    const updatedWorkouts = plan.workouts.map((exercise, exIndex) => {
      const updatedExercise = { ...exercise };
  
      for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
        const key = `${exIndex}-${setIndex}`;
        const rating = setRatings[key];
  
        if (rating) {
          if (rating <= 2) {
            updatedExercise.reps += 2;
            updatedExercise.weight += 5;
          } else if (rating >= 4) {
            updatedExercise.reps = Math.max(1, updatedExercise.reps - 2);
            updatedExercise.weight = Math.max(0, updatedExercise.weight - 5);
          }
        }
      }
  
      return updatedExercise;
    });
  
    return { ...plan, workouts: updatedWorkouts };
  };
  
  function redateSplit(split: SavedSplit, startDate: string): SavedSplit {
    const baseDate = new Date(startDate);
    console.log("baseDate: ", baseDate);
    const updatedDays = split.split.days.map((day, index) => {
      const newDate = addDays(baseDate, index);
      return {
        ...day,
        day: format(newDate, "MM-dd-yyyy"), // update the 'day' field with the new date
      };
    });
  
    return {
      ...split,
      split: {
        ...split.split,
        days: updatedDays,
      },
    };
  }

  const handleSetClick = (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  
    // Toggle rating view
    setActiveRatingSet(prev => (prev === key ? null : key));
  };  

  const getDayKey = (dateStr: string): string => {
    const dayIndex = new Date(dateStr).getDay(); // 0 (Sun) to 6 (Sat)
    return `Day ${dayIndex + 1}`; // Day 1 to Day 7
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

    const adjustedPlan = adjustWorkoutBasedOnRatings(workoutPlan);
    setWorkoutPlan(adjustedPlan); // Update the state with adjusted plan
    const progressData = {
      date: selectedDate,
      workouts: adjustedPlan?.workouts || [],
    };

    try {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        await updateDoc(progressRef, { workouts: arrayUnion(...progressData.workouts) });
      } else {
        await setDoc(progressRef, progressData);
      }
      setCompletedSets({}); // Reset completed sets after saving
      setSetRatings({}); // Reset ratings after saving
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
                backgroundColor: theme.colors.secondary,
                paddingVertical: theme.spacing.small,
                paddingHorizontal: theme.spacing.large,
                borderRadius: theme.borderRadius.medium,
                marginTop: theme.spacing.medium,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.buttonText, fontWeight: "bold", fontSize: theme.fontSize.medium }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {(!workoutPlan?.workouts || workoutPlan.workouts.length === 0) && (
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Text style={styles.label}>No exercises available for this day</Text>
        <TouchableOpacity
          style={styles.viewSavedButton}
          onPress={() => setSavedWorkoutModalVisible(true)} // You'll define this modal separately
        >
          <Text style={styles.buttonText}>Choose from saved workouts</Text>
        </TouchableOpacity>
      </View>
      )}

      <FlatList
        data={workoutPlan?.workouts || []}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item, index: exerciseIndex }) => (
        <View style={styles.workoutItem}>
          <Text style={styles.headerText}>
            {item.name} - {item.sets}x{item.reps} @ {item.weight}
          </Text>

      <View style={styles.setsContainer}>
        {Array.from({ length: item.sets }).map((_, setIndex) => {
          const key = `${exerciseIndex}-${setIndex}`;
          const isActive = activeRatingSet === key;

          return (
            <View key={key} style={{ marginBottom: 10 }}>
              <BouncyCheckbox
                isChecked={!!completedSets[key]}
                text={`Set ${setIndex + 1} - 1 x ${item.reps} @ ${item.weight} lbs`}
                textStyle={{
                textDecorationLine: completedSets[key] ? "line-through" : "none",
                color: "white", // make sure it's readable too
              }}
               onPress={() => handleSetClick(exerciseIndex, setIndex)}
              />
              {isActive && (
                <View style={styles.ratingContainer}>
                  <Text style={{ marginBottom: 4, color: theme.colors.text, fontSize: theme.fontSize.medium}}>How hard was this set?</Text>
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <TouchableOpacity
                        key={rating}
                        style={styles.ratingButton}
                        activeOpacity={0.8}
                        onPress={() => {
                          const newRatings = { ...setRatings, [key]: rating };
                          setSetRatings(newRatings);
                          console.log(`Set ${key} rated as ${rating}`);
                          setActiveRatingSet(null); // hide after selection
                        }}
                      >
                        <Text style={styles.ratingText}>{rating}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

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

      {/* Saved Workout Modal */}
      <Modal visible={isSavedWorkoutModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Saved Workouts</Text>

            <ScrollView style={{ maxHeight: "80%" }}>
              {savedSplits.map((split, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedWorkout(expandedWorkout === split.name ? null : split.name)
                    }
                    style={{
                      backgroundColor: theme.colors.cardBackground,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.primary,
                    }}
                  >
                    <Text style={{ fontSize: theme.fontSize.medium, fontWeight: "bold", color: theme.colors.primary }}>
                      {split.name}
                    </Text>
                  </TouchableOpacity>

                  {expandedWorkout === split.name && (
                    <View style={{ padding: 10, backgroundColor: "#222", borderRadius: 8, marginTop: 8 }}>
                      {split.split.days.map((day, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                          <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colors.text }}>{`Day ${i + 1}`}</Text>
                          {day.exercises.length > 0 ? (
                            day.exercises.map((ex, j) => (
                              <Text key={j} style={{ color: theme.colors.text, marginLeft: 10 }}>
                                • {ex.name} - {ex.sets}x{ex.reps} @ {ex.weight ?? "-"} lbs
                              </Text>
                            ))
                          ) : (
                            <Text style={{ color: "#aaa", marginLeft: 10 }}>No exercises</Text>
                          )}
                        </View>
                      ))}

                      {/* Select Workout Button */}
                      <TouchableOpacity
                        onPress={() => {
                          const updatedSplit = redateSplit(split, selectedDate); // 'selectedDate' should be in MM-dd-yyyy format
                          console.log("newSplit: ", updatedSplit);
                          setNewWorkout(updatedSplit);
                          setSavedWorkoutModalVisible(false);
                        }}
                        style={{
                          marginTop: 10,
                          backgroundColor: theme.colors.primary,
                          padding: 10,
                          borderRadius: 6,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Select Workout</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setSavedWorkoutModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
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
ratingContainer: {
  backgroundColor: theme.colors.cardBackground,
  padding: theme.spacing.medium,
  borderRadius: theme.borderRadius.small,
  marginTop: theme.spacing.small,
},
ratingButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 8,
},

ratingButton: {
  backgroundColor: theme.colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  marginHorizontal: 4,
  alignItems: "center",
},
ratingText: {
  color: theme.colors.buttonText,
  fontWeight: "bold",
  fontSize: theme.fontSize.medium,
},
setsContainer: {
  marginTop: theme.spacing.small,
  marginBottom: theme.spacing.medium,
  paddingHorizontal: theme.spacing.small,
},
});

export default WorkoutsPage;