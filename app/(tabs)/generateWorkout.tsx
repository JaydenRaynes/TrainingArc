import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { fetchUserBiometrics, fetchUserGym, fetchUserPreferences } from "../Services/fetchUserData";
import { Preferences } from "../models/preferenceModel";
import { Gym } from "../models/gymInfoModel";
import { Biometric } from "../models/biometricModel";
import { Split, WorkoutDay } from "../models/splitModel";
import { Exercise } from "../models/exerciseModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

type Date = { startDate: string };
type UserData = Preferences & Biometric & Gym & Date;

const normalizePreferences = (preferences: Preferences): Preferences => {
  return {
    ...preferences,
    activityLevel: {
      active: preferences.activityLevel?.active || false,
      notActive: preferences.activityLevel?.notActive || false,
      slightlyActive: preferences.activityLevel?.slightlyActive || false,
    },
    cardioPreferences: {
      cycling: preferences.cardioPreferences?.cycling || false,
      rowing: preferences.cardioPreferences?.rowing || false,
      running: preferences.cardioPreferences?.running || false,
      swimming: preferences.cardioPreferences?.swimming || false,
      walking: preferences.cardioPreferences?.walking || false,
    },
    equipmentPreference: {
      barbells: preferences.equipmentPreference?.barbells || false,
      dumbbells: preferences.equipmentPreference?.dumbbells || false,
      kettlebells: preferences.equipmentPreference?.kettlebells || false,
      none: preferences.equipmentPreference?.none || false,
      resistanceBands: preferences.equipmentPreference?.resistanceBands || false,
    },
    preferredWorkoutType: {
      bodyweight: preferences.preferredWorkoutType?.bodyweight || false,
      cardio: preferences.preferredWorkoutType?.cardio || false,
      hiit: preferences.preferredWorkoutType?.hiit || false,
      strength: preferences.preferredWorkoutType?.strength || false,
      yoga: preferences.preferredWorkoutType?.yoga || false,
    },
    timeOfDayPreference: {
      morning: preferences.timeOfDayPreference?.morning || false,
      afternoon: preferences.timeOfDayPreference?.afternoon || false,
      evening: preferences.timeOfDayPreference?.evening || false,
      night: preferences.timeOfDayPreference?.night || false,
      any: preferences.timeOfDayPreference?.any || false,
    },
    workoutEnvironment: {
      gym: preferences.workoutEnvironment?.gym || false,
      home: preferences.workoutEnvironment?.home || false,
      outdoor: preferences.workoutEnvironment?.outdoor || false,
    },
    workoutSplit: {
      fullBody: preferences.workoutSplit?.fullBody || false,
      targeted: preferences.workoutSplit?.targeted || false,
      weeklySplit: preferences.workoutSplit?.weeklySplit || false,
    },
  };
};

const GenerateWorkoutScreen: React.FC = () => {
  const localIP = "http://192.168.1.69:5000";
  
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

  const handleAddExercise = (dayIndex: number) => {
    //console.log("Adding exercise");
    setSelectedDayIndex(dayIndex);
    setAddModalVisible(true);
  };

  const generateExercise = async (exercise: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${localIP}/generate-exercise/${exercise}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPreferences),
      });

      const data = await response.json();
      console.log(data);
      const reformattedData = data.workoutPlan.replace(/^```json|```/g, '').replace(/\s*```$/g, '').trim();
      const newExercise: Exercise = JSON.parse(reformattedData);

      //console.log(workoutPlan);
      addExerciseToWorkout(newExercise || null);

    } catch (error) {
      console.error("Error generating workout:", error);
    }

    setLoading(false);
    setAddModalVisible(false);
  };
  
  const generateWorkout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${localIP}/generate-workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPreferences),
      });

      const data = await response.json();
      //console.log(data);
      const reformattedData = data.workoutPlan.replace(/^```json|```/g, '').replace(/\s*```$/g, '').trim();
      const workoutPlan: Split = JSON.parse(reformattedData);

      //console.log(workoutPlan);
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
    const tempPreferences = await fetchUserPreferences();
    const gym = await fetchUserGym();
    const startDate = "1-1-2000";

    if (!biometrics) {
      setWorkout(null);
      setLoading(false);
      return;
    }
    if (!tempPreferences) {
      setWorkout(null);
      setLoading(false);
      return;
    }


    // Normalize preferences to ensure all expected fields exist
    const preferences = normalizePreferences(tempPreferences);

    const defaultGym: Gym = {
      name: ["none"],
      geometry: { location: { latitude: 0, longitude: 0 } },
      types: ["none"],
      vicinity: "none",
      place_id: "",
      equipment: [],
    };

    const userInfo: UserData = {
      ...preferences,
      ...biometrics,
      ...(gym || defaultGym),
      startDate,
    };
    setUserData(userInfo);
    setLoading(false);
  }

  const renderWorkout = () => {
    if (!workout) return <Text>No workout plan available.</Text>;
  
    return (      Array.isArray(workout.days) && workout.days.length > 0 ? (
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
                    <Text style={styles.equipmentInfo}>{exercise.weight}</Text>
                  </View>

                  <View style={styles.equipmentInputContainer}>
                    <Text style={styles.equipmentLabel}>Repetitions: </Text>
                    <Text style={styles.equipmentInfo}>{exercise.reps}</Text>
                  </View>

                  <View style={styles.equipmentInputContainer}>
                    <Text style={styles.equipmentLabel}>Sets: </Text>
                    <TextInput
                      style={styles.equipmentInfo}
                      value={exercise.sets}
                      onChangeText={(text) => updateExerciseField(dayIndex, exIndex, "sets", text)}
                    />
                  </View>
                  <View style={styles.exerciseButtonsRow}>
                    <TouchableOpacity
                      style={styles.editExerciseButton}
                      onPress={() => setEditModalVisible(true)}
                    >
                      <Text style={styles.buttonSmallText}>Edit</Text>
                    </TouchableOpacity>
                    <Modal
                      visible={isEditModalVisible}
                      animationType="slide"
                      transparent
                      onRequestClose={() => setEditModalVisible(false)} // for Android back button
                    >
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                          <Text>Edit Exercise</Text>
                          <View>
                            <Text>Weight:</Text>
                            <TextInput
                              value={weight}
                              onChangeText={setWeight}
                              placeholder="Weight (lbs/kg)"
                              keyboardType="numeric"
                              style={styles.input}
                            />
                          </View>
                          <View>
                          <Text>Sets:</Text>
                            <TextInput
                              value={sets}
                              onChangeText={setSets}
                              placeholder="Sets"
                              keyboardType="numeric"
                              style={styles.input}
                            />
                          </View>
                          <View>
                            <Text>Reps:</Text>
                            <TextInput
                              value={reps}
                              onChangeText={setReps}
                              placeholder="Reps"
                              keyboardType="numeric"
                              style={styles.input}
                            />
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              const updatedExercise = {
                                ...editExercise,
                                sets: sets,
                                reps: reps,
                                weight: weight,
                              };
                              exercise.sets = updatedExercise.sets;
                              exercise.reps = updatedExercise.reps;
                              exercise.weight = updatedExercise.weight;
                              // Then close modal
                              setEditModalVisible(false);
                            }}
                          >
                            <Text>Save</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Text>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>

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

              {/* Modal for Exercise Input */}
              <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAddModalVisible(false)} // for Android back button
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                      <Text style={styles.modalTitle}>Select Muscle Group</Text>

                      <Picker
                        selectedValue={selectedMuscleGroup}
                        onValueChange={(itemValue) => setSelectedMuscleGroup(itemValue)}
                        style={{ height: 50, width: '100%' }}
                      >
                        <Picker.Item label="Chest" value="chest" />
                        <Picker.Item label="Back" value="back" />
                        <Picker.Item label="Legs" value="legs" />
                        <Picker.Item label="Shoulders" value="shoulder" />
                        <Picker.Item label="Abs" value="abs" />
                        <Picker.Item label="Arms" value="arms" />
                      </Picker>

                      <TouchableOpacity onPress={() => generateExercise(selectedMuscleGroup)}>
                        <Text>Generate Exercise for Selected Muscle Group</Text>
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
                        style={styles.saveButton}
                      >
                        <Text>Create New Exercise</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setAddModalVisible(false)}
                        style={styles.closeButton}
                      >
                        <Text>Close</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        ))
      ) : (
        <Text>No workout days available</Text> // Fallback if workout.days is empty or not an array
      )
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

  const handleSaveWorkoutPlan = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid, 'workout', 'currentWorkout');
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
      console.log("Workout does not exist, creating...");
      } else {
      console.log("Workout already exists, updating...");
      }

      await setDoc(userRef, {
      workout
      });

      // Fetch the document again to confirm it was saved
      const savedDoc = await getDoc(userRef);
      if (savedDoc.exists()) {
      console.log("Workout successfully saved:", savedDoc.data());
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
          {/* Date Input */}
          <Text style={styles.label}>Select Start Date</Text>
          <TextInput
            onChangeText={(text) => {
              setUserData((prev) => {
                if (!prev) return prev; // or return a default object if needed
                return {
                  ...prev,
                  startDate: text,
                };
              });
            }}
            placeholder="MM-DD-YYYY"
            placeholderTextColor="#888"
          />
          {renderWorkout()}
        </ScrollView>
      )}

      {/* Buttons at bottom */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.genButton} onPress={generateWorkout}>
          <Text style={styles.buttonText}>Generate</Text>
        </TouchableOpacity>

        {workout != null && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkoutPlan}>
            <Text style={styles.buttonText}>Save Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </KeyboardAvoidingView>
);

  
};

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: '100%', // Ensure it takes the full width of the container
    marginBottom: 15, // Add spacing around the picker
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },

  modalContainer: {
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F9FA",
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
    width: "95%",
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
    color: '#666',  // Set a color that contrasts with the rest
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
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});


export default GenerateWorkoutScreen;