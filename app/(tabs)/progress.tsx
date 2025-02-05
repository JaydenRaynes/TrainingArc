import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Import your Firestore configuration

const ProgressPage = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workouts, setWorkouts] = useState([]); // Store all workouts

  // Fetch all workout data from Firestore
  useEffect(() => {
    const userID = auth.currentUser?.uid; // Get the current user's ID
    if (!userID) return;

    const progressRef = collection(db, "users", userID, "progress");

    // Query to get all workouts (sorted by date)
    const q = query(progressRef, orderBy("date", "desc"));

    // Real-time listener using onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        // Get all workout data
        const workoutData = querySnapshot.docs.map(doc => doc.data());
        
        // Group workouts by exercise name and only keep the most recent one
        const groupedWorkouts = {};
        
        workoutData.forEach(workout => {
          const { workoutName, date } = workout;
          
          // If the workoutName already exists in the groupedWorkouts object, check if the current one is more recent
          if (!groupedWorkouts[workoutName] || new Date(date) > new Date(groupedWorkouts[workoutName].date)) {
            groupedWorkouts[workoutName] = workout;
          }
        });

        // Convert the grouped workouts object back to an array
        setWorkouts(Object.values(groupedWorkouts));
      } else {
        console.log("No workout data found");
        setWorkouts([]);
      }
    }, (error) => {
      console.error("Error fetching workout data:", error);
    });

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const openInfoModal = (exercise) => {
    setSelectedExercise(exercise);
    setInfoVisible(true);
  };

  const closeInfoModal = () => {
    setInfoVisible(false);
    setSelectedExercise(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Workout Progress</Text>
          {workouts.length > 0 ? (
            workouts.map((workout, index) => (
              <View key={index} style={styles.exerciseCard}>
                <Pressable style={styles.infoButton} onPress={() => openInfoModal(workout)}>
                  <Text style={styles.infoButtonText}>i</Text>
                </Pressable>

                <Text style={styles.titleText}>{workout.workoutName}</Text>
                <Text style={styles.subtitleText}>Sets: {workout.sets}</Text>
                <Text style={styles.subtitleText}>Reps: {workout.reps}</Text>
                <Text style={styles.subtitleText}>Weight: {workout.weight}</Text>
                <Text style={styles.subtitleText}>Completed: {workout.completed ? 'Yes' : 'No'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noWorkoutText}>No workout data available.</Text>
          )}
        </ScrollView>

        {/* Exercise Info Modal */}
        <Modal transparent={true} visible={infoVisible} animationType="fade">
          <TouchableWithoutFeedback onPress={closeInfoModal}>
            <View style={styles.infoModalBackground}>
              <View style={styles.infoModalView}>
                <Text style={styles.infoTitle}>{selectedExercise?.workoutName} Info</Text>
                <Text style={styles.infoContent}>Sets: {selectedExercise?.sets}</Text>
                <Text style={styles.infoContent}>Reps: {selectedExercise?.reps}</Text>
                <Text style={styles.infoContent}>Weight: {selectedExercise?.weight}</Text>
                <Text style={styles.infoContent}>Completed: {selectedExercise?.completed ? 'Yes' : 'No'}</Text>
                <Pressable style={styles.closeButton} onPress={closeInfoModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
    position: 'relative',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitleText: {
    fontSize: 18,
    color: 'black',
  },
  noWorkoutText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  infoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoModalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  infoContent: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
  },
  closeButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProgressPage;
