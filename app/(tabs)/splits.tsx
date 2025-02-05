// Splits Page (WorkoutPlanScreen.js)
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, ScrollView, TouchableOpacity } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const WorkoutPlanScreen = () => {
  const userID = auth.currentUser?.uid;
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [newWorkout, setNewWorkout] = useState({});

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!userID) return;
      const userRef = doc(db, "users", userID);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setWorkoutPlan(docSnap.data()?.workoutPlans || {});
      }
    };
    fetchWorkoutPlan();
  }, [userID]);

  const saveWorkoutPlan = async () => {
    if (!userID) return;
    try {
      const userRef = doc(db, "users", userID);
      await setDoc(userRef, { workoutPlans: workoutPlan }, { merge: true });
      console.log("Workout plan saved!");
const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set()); // Track expanded instructions

  const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/exercises';
  const API_KEY = 'F1MrXYbs75rYDmGS8V9GQw==nADb7j66vFLL1qmo';

  // Function to fetch exercises from the API
  const fetchExercises = async (query: string) => {
    try {
      setLoading(true); // Show loading spinner
      const response = await axios.get(API_NINJAS_URL, {
        headers: {
          'X-Api-Key': API_KEY,
        },
        params: {
          name: query, // Send search term to API
        },
      });
      setExercises(response.data); // Set exercises from API response
    } catch (error) {
      console.error("Error saving workout plan:", error);
    }
  };

  const updateSplit = (day, split) => {
    setWorkoutPlan((prev) => ({ ...prev, [day]: { ...prev[day], split, workouts: prev[day]?.workouts || [] } }));
  // Handle search button click
  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      fetchExercises(searchTerm); // Fetch exercises when user clicks search button
    }
  };

  const addWorkout = (day) => {
    if (!newWorkout[day]?.name) return;
    setWorkoutPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        workouts: [...(prev[day]?.workouts || []), { ...newWorkout[day], completed: false }],
      },
    }));
    setNewWorkout((prev) => ({ ...prev, [day]: { name: "", sets: "", reps: "", weight: "" } }));
  // Handle pressing the "Enter" key in the search field
  const handleEnterPress = (e: any) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      fetchExercises(searchTerm); // Fetch exercises when user presses Enter
    }
  };

  const deleteWorkout = (day, index) => {
    setWorkoutPlan((prev) => {
      const updatedWorkouts = prev[day].workouts.filter((_, i) => i !== index);
      return { ...prev, [day]: { ...prev[day], workouts: updatedWorkouts } };
  // Toggle instructions (expand/collapse)
  const toggleInstructions = (index: number) => {
    setExpandedInstructions((prevState) => {
      const newState = new Set(prevState);
      if (newState.has(index)) {
        newState.delete(index); // Collapse
      } else {
        newState.add(index); // Expand
      }
      return newState;
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
        <View key={day} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{day}</Text>
          <TextInput placeholder="Enter split (e.g., Push, Pull)" value={workoutPlan[day]?.split || ""} onChangeText={(text) => updateSplit(day, text)} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
          <FlatList
            data={workoutPlan[day]?.workouts || []}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <Text>{item.name} - {item.sets} sets x {item.reps} reps @ {item.weight} lbs</Text>
                <TouchableOpacity onPress={() => deleteWorkout(day, index)}>
                  <Text style={{ color: "red", marginLeft: 10 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TextInput placeholder="Workout Name" value={newWorkout[day]?.name || ""} onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], name: text } }))} style={{ borderBottomWidth: 1, marginBottom: 5 }} />
          <TextInput placeholder="Sets" value={newWorkout[day]?.sets || ""} onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], sets: text } }))} style={{ borderBottomWidth: 1, marginBottom: 5 }} />
          <TextInput placeholder="Reps" value={newWorkout[day]?.reps || ""} onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], reps: text } }))} style={{ borderBottomWidth: 1, marginBottom: 5 }} />
          <TextInput placeholder="Weight" value={newWorkout[day]?.weight || ""} onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, [day]: { ...prev[day], weight: text } }))} style={{ borderBottomWidth: 1, marginBottom: 5 }} />
          <Button title="Add Workout" onPress={() => addWorkout(day)} />
        </View>
      ))}
      <Button title="Save Plan" onPress={saveWorkoutPlan} />
    </ScrollView>
  );
};
export default WorkoutPlanScreen;