import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Import your Firestore configuration
import { theme } from '../utils/theme';

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
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        // Get all workout data
        const workoutData = querySnapshot.docs.map(doc => {
          console.log("Fetched Workout Data:", doc.data()); // Debugging log
          return doc.data();
        });
  
        // Flatten all workouts inside different dates
        const allWorkouts = workoutData.flatMap((entry) => entry.workouts || []);
  
        console.log("Processed Workouts:", allWorkouts); // Debugging log
  
        setWorkouts(allWorkouts);
      } else {
        console.log("No workout data found");
        setWorkouts([]);
      }
    }, (error) => {
      console.error("Error fetching workout data:", error);
    });
  
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
      <SafeAreaView style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Background color from theme
  },
  scrollContainer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  header: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: 'bold',
    color: theme.colors.primary, // Primary color
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  exerciseCard: {
    backgroundColor: theme.colors.cardBackground || "#1E1E2D", // Ensure card background exists in theme
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: theme.spacing.medium,
  },
  titleText: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitleText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary || "#B0B0B0", // Ensure textSecondary exists in theme
  },
  noWorkoutText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: theme.spacing.large,
  },
  infoButton: {
    position: 'absolute',
    top: theme.spacing.small,
    right: theme.spacing.small,
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: theme.colors.buttonText,
    fontWeight: 'bold',
    fontSize: theme.fontSize.medium,
  },
  infoModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoModalView: {
    width: '80%',
    backgroundColor: theme.colors.cardBackground || "#1E1E2D",
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  infoContent: {
    fontSize: theme.fontSize.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
    color: theme.colors.textSecondary || "#B0B0B0",
  },
  closeButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  closeButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});

export default ProgressPage;
