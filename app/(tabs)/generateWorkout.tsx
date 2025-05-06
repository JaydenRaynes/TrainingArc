import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from "react-native";
import { fetchUserBiometrics, fetchUserGym } from "../services/fetchUserData";
import { Gym } from "../models/gymInfoModel";
import { Biometric } from "../models/biometricModel";
import { Split, WorkoutDay } from "../models/splitModel";
import { Exercise } from "../models/exerciseModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { theme } from "../utils/theme";
import { useFocusEffect } from '@react-navigation/native';
import { SavedSplit } from '../models/savedWorkoutModel';

type UserData = Biometric & Gym;

const GenerateWorkoutScreen: React.FC = () => {
  const localIP = "http://138.47.138.205:5000"; // Replace with your local IP
  const [workout, setWorkout] = useState<Split | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);  // to toggle modal visibility
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');  // selected muscle group
  const [exerciseName, setExerciseName] = useState('');  // name of the custom exercise
  const [currDay, setSelectedDayIndex] = useState<number>(0);
  const [userPreferences, setUserData] = useState<UserData | null>(null);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null); // Holds the selected exercise to edit
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "MM-dd-yyyy"));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isSaveWorkoutVisible, setSavedModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setCalendarVisible(true); // open calendar whenever screen is focused
    }, [])
  );

  const handleAddExercise = (dayIndex: number) => {
    //console.log("Adding exercise");
    setSelectedDayIndex(dayIndex);
    setAddModalVisible(true);
  };

  const generateExercise = async (exercise: string) => {
    setLoading(true);
    try {

      const requestBody = {
        ...userPreferences,
        startDate: selectedDate,
      }

      const response = await fetch(`${localIP}/generate-exercise/${exercise}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      //console.log("RESPONSE: ", data)
      const reformattedData = JSON.parse(data.workoutPlan);

      const newExercise: Exercise = reformattedData.exercises[0];

      //console.log("newExercise: ", newExercise);
      addExerciseToWorkout(newExercise || null);

    } catch (error) {
      console.error("Error generating workout:", error);
    }

    setLoading(false);
    setAddModalVisible(false);
  };
  
  const generateWorkout = async (selectedDate: string) => {
    setLoading(true);
    try {

      const requestBody = {
        ...userPreferences,
        startDate: selectedDate,
      }

      const response = await fetch(`${localIP}/generate-workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json(); // data.workoutPlan is still a string
      const parsedPlan = JSON.parse(data.workoutPlan); // parsedPlan.Split.days
      
      // ✅ Extract the days and wrap them properly
      const workoutPlan = { days: parsedPlan.Split.days };
      
      setWorkout(workoutPlan || null);

    } catch (error) {
      console.error("Error generating workout:", error);
      setWorkout(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    combineUserData();
  }, []);

  const combineUserData = async () => {
    setLoading(true);
    const biometrics = await fetchUserBiometrics();
    //const tempPreferences = await fetchUserPreferences();
    const gym = await fetchUserGym();

    if (!biometrics) {
      setWorkout(null);
      setLoading(false);
      return;
    }

    const defaultGym: Gym = {
      name: ["none"],
      geometry: { location: { latitude: 0, longitude: 0 } },
      types: ["none"],
      vicinity: "none",
      place_id: "",
      equipment: [],
    };

    const userInfo: UserData = {
      //...preferences,
      ...biometrics,
      ...(gym || defaultGym),
    };
    setUserData(userInfo);
    setLoading(false);
  }

  const renderWorkout = () => {
    const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Abs', 'Arms'];
    if (!workout) return <Text>No workout plan available.</Text>;
  
    return (
      <View>
        {Array.isArray(workout.days) && workout.days.length > 0 ? (
          workout.days.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.workoutDay}>
              <Text style={styles.dayTitle}>{day.day}</Text>
    
              {/* Check if day.exercises is an array before mapping */}
              {Array.isArray(day.exercises) && day.exercises.length > 0 ? (
                day.exercises.map((exercise, exIndex) => (
                  <View key={exIndex} style={styles.exerciseContainer}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>

                    <View style={styles.muscleInputContainer}>
                      <Text style={styles.muscleLabel}>Muscle Group: </Text>
                      <Text style={styles.muscleInfo}>{exercise.muscle}</Text>
                    </View>

                    <View style={styles.equipmentInputContainer}>
                      <Text style={styles.equipmentLabel}>Equipment: </Text>
                      <Text style={styles.equipmentInfo}>{exercise.equipment}</Text>
                    </View>

                    <View style={styles.equipmentInputContainer}>
                      <Text style={styles.equipmentLabel}>Weight: </Text>
                      <Text style={styles.equipmentInfo}>
                        {exercise.weight !== undefined && parseFloat(exercise.weight) === 0 
                          ? "Body Weight" 
                            : exercise.weight !== undefined && parseFloat(exercise.weight) > 0
                              ? `${exercise.weight} lbs`
                              : "Error"}
                      </Text>
                    </View>

                    <View style={styles.equipmentInputContainer}>
                      <Text style={styles.equipmentLabel}>Repetitions: </Text>
                      <Text style={styles.equipmentInfo}>{exercise.reps}</Text>
                    </View>

                    <View style={styles.equipmentInputContainer}>
                      <Text style={styles.equipmentLabel}>Sets: </Text>
                      <Text style={styles.equipmentInfo}>{exercise.sets}</Text>
                    </View>
                    <View style={styles.exerciseButtonsRow}>
                      <TouchableOpacity
                        style={styles.editExerciseButton}
                        onPress={() => {
                          setSelectedExercise(exercise);
                          setWeight(exercise.weight || "");
                          setSets(exercise.sets || "");
                          setReps(exercise.reps || "");
                          setSelectedDayIndex(dayIndex);
                          setSelectedExerciseIndex(exIndex);
                          setEditModalVisible(true);
                          setEditModalVisible(true);
                        }}
                      >
                        <Text style={styles.buttonSmallText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeExerciseButton}
                        onPress={() => removeExercise(dayIndex, exIndex)}
                      >
                        <Text style={styles.buttonSmallText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))

              ) : (
                <Text style={styles.label}>No exercises available for this day</Text> // Optional fallback if exercises are empty
              )}
              <View>
                <TouchableOpacity style={styles.addExerciseButton} onPress={() => handleAddExercise(dayIndex)}>
                  <Text style={styles.buttonText}>+ Add Exercise</Text>
                </TouchableOpacity>                
              </View>
            </View>
          ))
          
        ) : (
          <Text>No workout days available</Text> // Fallback if workout.days is empty or not an array
        )}
        
        {/* Modal for Add Exercise Input */}
        {isAddModalVisible && (
          <Modal
            visible={isAddModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setAddModalVisible(false)} // for Android back button
          >
            <View style={styles.modalOverlay}>
              <View style={styles.editModalContainer}>
                <Text style={styles.modalTitle}>Add a New Exercise</Text>

                <TouchableOpacity onPress={() => generateExercise(selectedMuscleGroup)}>
                  <Text>Generate Exercise for Selected Muscle Group</Text>
                </TouchableOpacity>


                <FlatList
                  key={'muscle-group-2-columns'}
                  data={muscleGroups}
                  keyExtractor={(item) => item}
                  numColumns={2}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        margin: 8,
                        padding: 15,
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                        backgroundColor: selectedMuscleGroup === item.toLowerCase() ? '#ddd' : '#fff',
                        borderWidth: 1,
                        borderColor: '#ccc',
                      }}
                      onPress={() => setSelectedMuscleGroup(item.toLowerCase())}
                    >
                      <Text style={{ fontSize: 16, textAlign: 'center' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={() => generateExercise(selectedMuscleGroup)}
                  style={styles.addGenButton}
                >
                  <Text>Create New Exercise</Text>
                </TouchableOpacity>

                <Text>Or Enter Exercise Name</Text>
                <TextInput
                  value={exerciseName}
                  onChangeText={setExerciseName}
                  placeholder="Type exercise name"
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => generateExercise(exerciseName)}
                  style={styles.addGenButton}
                >
                  <Text>Create New Exercise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAddModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {isEditModalVisible && selectedExercise !== null && (
          <Modal
            visible={isEditModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.editModalContainer}>
                <Text>Edit Exercise</Text>

                {/* Weight */}
                <Text>Weight:</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Weight (lbs/kg)"
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Sets */}
                <Text>Sets:</Text>
                <TextInput
                  value={sets}
                  onChangeText={setSets}
                  placeholder="Sets"
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Reps */}
                <Text>Reps:</Text>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder="Reps"
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* Save */}
                <TouchableOpacity
                  onPress={() => {
                    if (
                      currDay !== null &&
                      selectedExerciseIndex !== null &&
                      workout.days[currDay]?.exercises[selectedExerciseIndex]
                    ) {
                      workout.days[currDay].exercises[selectedExerciseIndex] = {
                        ...workout.days[currDay].exercises[selectedExerciseIndex],
                        sets,
                        reps,
                        weight,
                      };
                    }

                    setEditModalVisible(false);
                    setSelectedExercise(null);
                  }}
                >
                  <Text>Save</Text>
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  };
  
  const removeExercise = (dayIndex: number, exIndex: number) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
      const updatedWorkout = { ...prevWorkout };
      updatedWorkout.days[dayIndex].exercises.splice(exIndex, 1);
      return updatedWorkout;
    });
  };
  
  function generalizeWorkout(split: Split): Split {
    const updatedDays = split.days.map((day, index) => ({
      ...day,
      day: `day${index + 1}`, // Replace actual date with "day1", "day2", ...
    }));
  
    return { days: updatedDays };
  }
  

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (currDay === null) return;

    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
  
      const updatedWorkout = { ...prevWorkout };
      if (exercise) {
        updatedWorkout.days[currDay].exercises.push(exercise);  // Add exercise to the first day for now
      }
      else {
        console.log("Error adding new exercise");
      }
      return updatedWorkout;
    });
    setSelectedDayIndex(0);
  };
  
  const updateExerciseField = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
    setWorkout((prevWorkout) => {
      if (!prevWorkout) return null;
  
      const updatedWorkout = { ...prevWorkout };
      updatedWorkout.days[dayIndex].exercises[exIndex][field] = value;
  
      return updatedWorkout;
    });
  };

  const openEditModal = (exercise: Exercise) => {
    setEditExercise(exercise);
    setSets(exercise.sets?.toString() || '');
    setReps(exercise.reps?.toString() || '');
    setWeight(exercise.weight?.toString() || '');
    setEditModalVisible(true);
  };

  const handleSaveWorkoutPlan = async (addToWorkout: Split, workoutPresetName: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }
    try {
      const userRefCurrWorkout = doc(db, 'users', user.uid, 'workout', 'currentWorkout');
      const docSnapCurrWorkout = await getDoc(userRefCurrWorkout);
      const userRefSavedWorkouts = doc(db, 'users', user.uid, 'savedWorkouts', 'workouts');
      const docSnapSavedWorkouts = await getDoc(userRefSavedWorkouts);

      if (!docSnapCurrWorkout.exists()) {
      console.log("Workout does not exist, creating...");
      } else {
      console.log("Workout already exists, updating...");
      }

      let existingSavedWorkouts: SavedSplit[] = [];

      if (!docSnapSavedWorkouts.exists()) {
      console.log("Workout does not exist, creating...");
      existingSavedWorkouts = [];
      } else {
      console.log("Workout already exists, updating...");
      
      const data = docSnapSavedWorkouts.data();
      if (Array.isArray(data.workouts)) {
        existingSavedWorkouts = data.workouts;
      } else {
        console.warn("Unexpected type for 'workouts' in Firestore:", typeof data.workouts);
        existingSavedWorkouts = [];
      }

      }

      await setDoc(userRefCurrWorkout, {
        workout: addToWorkout
      });

      const generalizedSplit: SavedSplit = { name: workoutPresetName, split: generalizeWorkout(addToWorkout) }
      const updatedWorkouts = [...existingSavedWorkouts, generalizedSplit];

      await setDoc(userRefSavedWorkouts, {
        workouts: updatedWorkouts
      }, {merge: true});

      // Fetch the document again to confirm it was saved
      const savedDocCurrWorkout = await getDoc(userRefCurrWorkout);
      const savedDocSavedWorkouts = await getDoc(userRefSavedWorkouts);
      if (savedDocCurrWorkout.exists() && savedDocSavedWorkouts.exists()) {
      console.log("Workout successfully saved:", savedDocCurrWorkout.data(), savedDocSavedWorkouts.data());
      Alert.alert('Success', 'Workout saved!');
      } else {
      console.error("Failed to confirm workout save.");
      Alert.alert('Error', 'Failed to confirm workout save.');
      }
    } catch (error) {
      console.error('Error saving workout to Firestore:', error);
      Alert.alert('Error', 'Failed to save workout.');
    }
  };

return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={80}
  >
    <View style={styles.container}>
      <Text style={styles.title}>Your AI-Generated Workout Plan</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} // Add padding here
        >
          {/* Calendar Modal */}
          <Modal visible={calendarVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.calenderModalContent}>
                <Text style={styles.label}>Please select your preferred start day:</Text>
                <Calendar
                  onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setCalendarVisible(false);
                  generateWorkout(day.dateString);
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
                  <Text style={{ color: "#FFA500", fontWeight: "bold", fontSize: theme.fontSize.medium }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {renderWorkout()}
        </ScrollView>
      )}

      {/* Buttons at bottom */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.genButton} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.buttonText}>Generate</Text>
        </TouchableOpacity>

        {workout != null && (
          <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setSavedModalVisible(true)}
            >
              <Text style={styles.buttonText}>Save Workout</Text>
            </TouchableOpacity>

            <Modal
              visible={isSaveWorkoutVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setSavedModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.editModalContainer}>
                  <Text style={styles.modalTitle}>Name Your Workout</Text>
                  <TextInput
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    placeholder="Enter workout name"
                    style={styles.input}
                  />
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      handleSaveWorkoutPlan(workout, workoutName); // Call your save logic here
                      setSavedModalVisible(false);
                      setWorkoutName('');
                    }}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setSavedModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}

      </View>
    </View>
  </KeyboardAvoidingView>
);

  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center",     // centers horizontally
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent backdrop
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },

  calenderModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // optional: darken background
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  editModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },

  editModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10, // Rounded corners for a softer look
    padding: 20,
    elevation: 5, // Add shadow for elevation (Android)
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure modal appears on top of everything else
  },

  exerciseButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  editExerciseButton: {
    backgroundColor: '#1E90FF',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  
  removeExerciseButton: {
    backgroundColor: '#FF4C4C',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  
  addExerciseButton: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  
  buttonSmallText: {
    color: 'white',
    fontWeight: 'bold',
  },  
  
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20, // You can tweak this for different devices
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },  

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 10,
    textAlign: "center",
  },

  scrollContainer: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },

  workoutDay: {
    backgroundColor: "#2C2C38",
    padding: 15,
    borderRadius: 12,
    width: 360, // or try 360 if you want fixed
    alignSelf: "center", // centers the container
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 8,
    textAlign: "center",
  },

  exerciseContainer: {
    backgroundColor: "#1E1E2D",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  input: {
    backgroundColor: "#333344",
    color: "#FFF",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 8,
  },

  exerciseName: {
    fontSize: 18,  // Make the exercise name larger
    fontWeight: 'bold',  // Makes it bold to stand out
    color: "#FFA500",  // Set a color that contrasts with the rest
  },
  muscleInfo: {
    fontSize: 14,  // Slightly smaller font size for muscle
    color: 'white',  // A lighter color to make it less prominent
  },
  equipmentInfo: {
    fontSize: 14,  // Same size as muscle info
    color: 'white',  // A lighter color for equipment info
  },

  buttonContainer: {
    flexDirection: 'row', // This arranges buttons in a row (side by side)
    justifyContent: 'space-between', // Space out buttons
    alignItems: 'center',
    marginTop: 2,  // Add some margin at the top
    marginBottom: 5,
    bottom: 60,
    zIndex: 1000,
  },
  genButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    width: "45%",
    alignItems: "center",
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: 'white',  // Button text color
    fontSize: 18,  // Text size
    fontWeight: 'bold',  // Bold text for prominence
  },
  muscleLabel: {
    fontWeight: "bold", // Make the label stand out
    fontSize: 14,
    color: 'white',
  },
  equipmentLabel: {
    fontWeight: "bold", // Make the label stand out
    fontSize: 14,
    color: 'white'
  },
  muscleInputContainer: {
    flexDirection: "row", // Arrange label and input side by side
    alignItems: "center", // Align them vertically
  },
  equipmentInputContainer: {
    flexDirection: "row", // Arrange label and input side by side
    alignItems: "center", // Align them vertically
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  calenderModalContent: {
    width: '90%', // Or fixed like 300
    backgroundColor: theme.colors.cardBackground, // or 'white'
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center', // center everything inside
    elevation: 5, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  addGenButton: {
    backgroundColor: "#32CD32",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  }
  
});


export default GenerateWorkoutScreen;