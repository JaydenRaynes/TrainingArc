import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, Button, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Calendar } from "react-native-calendars"; // Import Calendar
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, setDoc } from "firebase/firestore";
<<<<<<< HEAD
import { format, parseISO, parse, addDays } from "date-fns";
=======
import { addDays, format, parse } from "date-fns";
>>>>>>> 3dd3b73 (got saved workouts to display)
import { useRouter } from "expo-router";
import { theme } from "../utils/theme";
import WorkoutChatbot from "../component/WorkoutChatbot";
<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
import WorkoutSourceToggle from "../component/changeWorkout";
import { SavedSplit } from "../models/savedWorkoutModel";
<<<<<<< HEAD
<<<<<<< HEAD
import { Split, WorkoutDay } from "../models/splitModel";
=======
import { SavedSplit } from "../models/savedWorkoutModel";
>>>>>>> c174b5b (added ability so save workout presets)
=======
import { Split } from "../models/splitModel";
>>>>>>> 3dd3b73 (got saved workouts to display)
=======
import { Split, WorkoutDay } from "../models/splitModel";
>>>>>>> d09f937 (got adding the saved exercises fully working)

const API_KEY = "2VhN5ZCAl1Drgyx6t9tb5w==7Uv8h7cd6WmVkAqP"; // Replace with your API Key

const WorkoutsPage = () => {
  const router = useRouter();
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState<{
    split: string;
    workouts: { name: string; sets: number; reps: number; weight: number; completed: boolean }[];
  } | null>(null);

  const todayDate = format(new Date(), "MM-dd-yyyy"); // ISO format required by markedDates
  const [today, setToday] = useState(format(new Date(), "EEEE"));
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "MM-dd-yyyy"));
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
<<<<<<< HEAD
  const [showFooterButtons, setShowFooterButtons] = useState(false);
  const [useAIWorkout, setUseAIWorkout] = useState(true);
=======
>>>>>>> c174b5b (added ability so save workout presets)
  const [isSavedWorkoutModalVisible, setSavedWorkoutModalVisible] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [savedSplits, setSavedSplits] = useState<SavedSplit[]>([]);


  useEffect(() => {
<<<<<<< HEAD
    let unsubscribe: (() => void) | null = null;

    const loadWorkout = async () => {
      setWorkoutPlan(null); // Reset workout plan when loading new data

      if (useAIWorkout) {
        unsubscribe = fetchAIWorkoutData(selectedDate);
      } else {
        await fetchUserWorkoutData(selectedDate);
        // Since fetchUserWorkoutData is a one-time fetch, set unsubscribe to null
        unsubscribe = null;
      }
    };

    loadWorkout(); // Call loadWorkout whenever dependencies change

    // Load completed sets (this should likely only depend on selectedDate)
    const loadCompletedSets = async () => {
      try {
        const storageKey = `completedSets-${selectedDate}`;
        const saved = await AsyncStorage.getItem(storageKey);
        setCompletedSets(saved ? JSON.parse(saved) : {});
      } catch (e) {
        console.error('Failed to load completed sets', e);
      }
    };

    loadCompletedSets();
    fetchSavedSplits();

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Clean up AI workout listener
      }
    };
  }, [userID, selectedDate, useAIWorkout]);


  const fetchSavedSplits = async () => {
=======
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
>>>>>>> c174b5b (added ability so save workout presets)
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

  const fetchAIWorkoutData = (date: string) => {
    if (!userID) return () => {};

    const userRef = doc(db, "users", userID, "workout", "currentWorkout");

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const [month, day, year] = date.split("-");
        const formattedDate = `${month}-${day}-${year}`;
        //const dayKey = getDayKey(date); // e.g. "Day 1"
        const [year, month, day] = date.split('-');
        const formattedDate = `${month}-${day}-${year}`;
        const workoutDays = data.workout?.days || [];
        const matchedDay = workoutDays.find((d: any) => d.day === formattedDate);
<<<<<<< HEAD

        const matchedDay = workoutDays.find((d: any) => d.day === formattedDate);
  
=======
>>>>>>> c174b5b (added ability so save workout presets)
        if (matchedDay) {
          setWorkoutPlan({
            split: formattedDate,
            split: formattedDate,
            workouts: matchedDay.exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
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

    return unsubscribe;
  };

  const setNewWorkout = async (presetSplit: SavedSplit) => {
    if (!userID) return;
<<<<<<< HEAD
=======
  
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
>>>>>>> 3dd3b73 (got saved workouts to display)
  
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
  
  const fetchUserWorkoutData = async (date: string) => {
    if (!userID) return;

    const userRef = doc(db, "users", userID);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const workoutDay = format(parse(date, "MM-dd-yyyy", new Date()), "EEEE"); // "Monday", etc.

    const plan = data?.workoutPlans?.[workoutDay]?.workouts || [];

    const formattedWorkout = {
      split: workoutDay,
      workouts: plan.map((w: any) => ({
        name: w.name,
        sets: w.sets,
        reps: w.reps,
        weight: w.weight,
        completed: false,
      })),
    };

    setWorkoutPlan(formattedWorkout);
  };
  
  const handleRatingChange = (exerciseIndex: number, setIndex: number, rating: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    const newRatings = { ...setRatings, [key]: rating };
    setSetRatings(newRatings);
  
    // Immediately adjust the next sets in the workoutPlan
    setWorkoutPlan(prevPlan => {
      if (!prevPlan) return prevPlan;
  
      const updatedPlan = { ...prevPlan };
      const exercise = updatedPlan.workouts[exerciseIndex];
  
      // Only update NEXT sets, not past sets
      for (let nextSetIndex = setIndex + 1; nextSetIndex < exercise.sets; nextSetIndex++) {
        if (rating <= 2) {
          exercise.reps += 2;
          exercise.weight += 5;
        } else if (rating >= 4) {
          exercise.reps = Math.max(1, exercise.reps - 2);
          exercise.weight = Math.max(0, exercise.weight - 5);
        }
      }
  
      return updatedPlan;
    });
  
<<<<<<< HEAD
    // After rating is chosen, close the rating UI
    setActiveRatingSet(null);
=======
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
>>>>>>> 3dd3b73 (got saved workouts to display)
  };  
  
  function redateSplit(split: SavedSplit, startDate: string): SavedSplit {
    const baseDate = parse(startDate, "MM-dd-yyyy", new Date());
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

  const handleSetClick = async (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    const isCurrentlyCompleted = completedSets[key];
    const updated = { ...completedSets, [key]: !isCurrentlyCompleted };
    setCompletedSets(updated);
  
    // Save to AsyncStorage
    try {
      const storageKey = `completedSets-${selectedDate}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save completed sets', e);
    }
  
    // Get exercise to check how many sets there are
    const exercise = workoutPlan?.workouts[exerciseIndex];
    if (!exercise) return;
  
    const isLastSet = setIndex === exercise.sets - 1;
  
    // ✅ Only show the rating container if the set was just checked
    if (!isCurrentlyCompleted && !isLastSet) {
      setActiveRatingSet(key);
    } else {
      setActiveRatingSet(null); // hide on uncheck or last set
    }
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

  const saveToProgress = async () => {
    if (!userID || !selectedDate || !workoutPlan || !workoutPlan.workouts) return;
  
    try {
      for (let i = 0; i < workoutPlan.workouts.length; i++) {
        const workout = workoutPlan.workouts[i];
        const completedSetIndices: number[] = [];
  
        for (let j = 0; j < workout.sets; j++) {
          const key = `${i}-${j}`;
          if (completedSets[key]) {
            completedSetIndices.push(j);
          }
        }
  
        // Skip if no sets were completed
        if (completedSetIndices.length === 0) continue;
  
        const setCount = completedSetIndices.length;
        const reps = workout.reps;
        const weight = workout.weight;
        const exerciseName = workout.name;
  
        const newEntry = {
          date: selectedDate,
          sets: setCount,
          reps,
          weight,
        };
  
        const exerciseRef = doc(db, "users", userID, "progress", exerciseName);
        const docSnap = await getDoc(exerciseRef);
  
        if (docSnap.exists()) {
          await updateDoc(exerciseRef, {
            history: arrayUnion(newEntry),
          });
        } else {
          await setDoc(exerciseRef, {
            history: [newEntry],
          });
        }
      }
  
      //setCompletedSets({});
      setSetRatings({});
      Alert.alert("Success", "Completed Exercises Saved!");
    } catch (error) {
      console.error("Error saving progress:", error);
      Alert.alert("Error", "Failed to save workouts.");
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

  const selectedDateForCalendar = format(parse(selectedDate, "MM-dd-yyyy", new Date()), "yyyy-MM-dd");
  
  const markedDates = {
    [todayDate]: {
      customStyles: {
        container: { backgroundColor: theme.colors.warning },
        text: { color: theme.colors.blackText },
      },
    },
    [selectedDateForCalendar]: {
      selected: true,
      selectedColor: theme.colors.primary,
      selectedTextColor: theme.colors.blackText,
    },
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
            onDayPress={(today) => {
              const selectedDay = parseISO(today.dateString);
              const dayName = format(selectedDay, "EEEE");
              const newDate = format(parseISO(today.dateString), "MM-dd-yyyy");
              setToday(dayName); // Update the day name
              setSelectedDate(newDate); // format correctly
              if (useAIWorkout) {
                fetchAIWorkoutData(newDate);
              } else {
                fetchUserWorkoutData(newDate);
              }
              setCalendarVisible(false);
            }}            
            markedDates={markedDates}
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
<<<<<<< HEAD
      <WorkoutSourceToggle
        useAIWorkout={useAIWorkout}
        setUseAIWorkout={setUseAIWorkout}
      />
=======
>>>>>>> c174b5b (added ability so save workout presets)
      
      {(!workoutPlan?.workouts || workoutPlan.workouts.length === 0) && (
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Text style={styles.label}>No exercises available for this day</Text>
        <TouchableOpacity
          style={styles.viewSavedButton}
          onPress={() => setSavedWorkoutModalVisible(true)} // You'll define this modal separately
        >
<<<<<<< HEAD
<<<<<<< HEAD
          <Text style={styles.buttonText}>Choose from saved workouts</Text>
=======
          <Text style={styles.buttonText}>View Saved Workouts</Text>
>>>>>>> c174b5b (added ability so save workout presets)
=======
          <Text style={styles.buttonText}>Choose from saved workouts</Text>
>>>>>>> 3dd3b73 (got saved workouts to display)
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
                        onPress={() => handleRatingChange(exerciseIndex, setIndex, rating)}
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
<<<<<<< HEAD
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: theme.colors.warning }]}
      onPress={() => setShowFooterButtons(prev => !prev)}
    >
    <Text style={styles.saveButtonText}>
      {showFooterButtons ? "Hide Options" : "Show Options"}
    </Text>
    </TouchableOpacity>

<<<<<<< HEAD
    {/* Conditionally Render Footer Buttons and Chatbot */}
    {showFooterButtons && (
      <>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveToProgress()}
        >
          <Text style={styles.saveButtonText}>Save Completed Workouts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/component/splits")}
        >
          <Text style={styles.editButtonText}>Edit Splits Page</Text>
        </TouchableOpacity>

        {/* Chatbot appears with options */}
        <WorkoutChatbot />
      </>
      )}

      {/* Saved Workout Modal */}
=======

>>>>>>> c174b5b (added ability so save workout presets)
=======
      {/* Saved Workout Modal */}
>>>>>>> 3dd3b73 (got saved workouts to display)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3dd3b73 (got saved workouts to display)

                      {/* Select Workout Button */}
                      <TouchableOpacity
                        onPress={() => {
                          const updatedSplit = redateSplit(split, selectedDate); // 'selectedDate' should be in MM-dd-yyyy format
<<<<<<< HEAD
=======
                          console.log("newSplit: ", updatedSplit);
>>>>>>> 3dd3b73 (got saved workouts to display)
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
<<<<<<< HEAD
=======
>>>>>>> c174b5b (added ability so save workout presets)
=======
>>>>>>> 3dd3b73 (got saved workouts to display)
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
<<<<<<< HEAD
=======

      <TouchableOpacity style={styles.saveButton} onPress={saveToProgress}>
        <Text style={styles.saveButtonText}> Save Completed Workouts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={() => router.push("/component/splits")}>
        <Text style={styles.editButtonText}> Edit Splits Page</Text>
      </TouchableOpacity>
      <WorkoutChatbot />
>>>>>>> c174b5b (added ability so save workout presets)
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