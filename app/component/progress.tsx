import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, ScrollView, TouchableWithoutFeedback, Dimensions, TouchableOpacity} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot, getDoc, getDocs, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';
import { theme } from "../utils/theme"
import { Stack } from 'expo-router';
import { useRouter } from "expo-router";

const ProgressPage = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const router = useRouter();

  type Workout = {
    workoutName: string;
    bestSet: {
      sets: number;
      reps: number;
      weight: number;
      date?: string;
    };
  };  

  useEffect(() => {
    let isMounted = true;
  
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user || !isMounted) return;
  
      try {
        const progressRef = collection(db, "users", user.uid, "progress");
        const querySnapshot = await getDocs(progressRef);
        const allWorkouts: Workout[] = [];
  
        querySnapshot.forEach(docSnap => {
          const exerciseName = docSnap.id;
          const data = docSnap.data();
        
          if (Array.isArray(data.history) && data.history.length > 0) {
            // Get best set (e.g., max estimated 1-rep max)
            const bestEntry = data.history.reduce((best, current) => {
              const bestMax = best.weight * (1 + best.reps / 30);
              const currentMax = current.weight * (1 + current.reps / 30);
              return currentMax > bestMax ? current : best;
            });
        
            allWorkouts.push({
              workoutName: exerciseName,
              bestSet: bestEntry,
            });
          }
        });
        
  
        allWorkouts.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        if (isMounted) setWorkouts(allWorkouts);
      } catch (error) {
        console.error("Error fetching all progress data:", error);
      }
    });
  
    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);
  

  const openInfoModal = (exercise) => {
    setSelectedExercise(exercise);
    fetchExerciseHistory(exercise.workoutName);
    setInfoVisible(true);
  };

  const closeInfoModal = () => {
    setInfoVisible(false);
    setSelectedExercise(null);
    setExerciseHistory([]);
  };

  const fetchExerciseHistory = async (exerciseName) => {
    const userID = auth.currentUser?.uid;
    if (!userID || !exerciseName) return;
  
    try {
      const exerciseRef = doc(db, "users", userID, "progress", exerciseName);
      const docSnap = await getDoc(exerciseRef);
  
      if (!docSnap.exists()) {
        console.log("No progress found for this exercise.");
        setExerciseHistory([]);
        return;
      }
  
      const data = docSnap.data();
      const history = [];
  
      data.history.forEach(entry => {
        const { date, weight, reps } = entry;
  
        const numWeight = parseFloat(weight);
        const numReps = parseInt(reps);
  
        if (!isNaN(numWeight) && !isNaN(numReps)) {
          const maxRep = Math.round(numWeight * (1 + numReps / 30));
          history.push({ date, maxRep });
        }
      });
  
      // Optional: sort by date (if date is ISO string like "2025-04-27")
      history.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  
      setExerciseHistory(history);
    } catch (error) {
      console.error("Error fetching exercise history:", error);
      setExerciseHistory([]);
    }
  };  
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ margin: 10 }}>
        <Text style={{ color: "Black", fontSize: 18 }}>←</Text>
      </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Workout Progress</Text>
          {workouts.length > 0 ? (
            workouts.map((workout, index) => {
              const bestSet = `${workout.bestSet.sets}x${workout.bestSet.reps} @ ${workout.bestSet.weight} lbs`;
              const estimatedMax = `1 rep of ${Math.round(workout.bestSet.weight * (1 + workout.bestSet.reps / 30))} lbs`;                           

              return (
                <View key={index} style={styles.exerciseCard}>
                  <Pressable style={styles.infoButton} onPress={() => openInfoModal(workout)}>
                    <Text style={styles.infoButtonText}>i</Text>
                  </Pressable>
                  <Text style={styles.titleText}>{workout.workoutName}</Text>
                  <Text style={styles.subtitleText}>Best Set: {bestSet}</Text>
                  <Text style={styles.subtitleText}>Est. Max Rep: {estimatedMax}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noWorkoutText}>No workout data available.</Text>
          )}
        </ScrollView>

        {/* Exercise Info Modal */}
        <Modal transparent={true} visible={infoVisible} animationType="fade">
          <TouchableWithoutFeedback onPress={closeInfoModal}>
            <View style={styles.infoModalBackground}>
              <View style={styles.infoModalView}>
                <Text style={styles.infoTitle}>{selectedExercise?.workoutName} Progress</Text>
                {exerciseHistory.length > 0 ? (
                  <LineChart
                    data={{
                      labels: exerciseHistory.map((_, index) => index + 1),
                      datasets: [{
                        data: exerciseHistory.map(entry => entry.maxRep),
                      }],
                    }}
                    width={Dimensions.get("window").width * 0.75}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=" lbs"
                    chartConfig={{
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      strokeWidth: 2,
                      decimalPlaces: 0,
                      yAxisMin: 0, // Set the minimum value of the y-axis to 0
                      yAxisInterval: 20, // Set the interval between y-axis values to 50
                    }}
                    bezier
                    style={{ marginVertical: 10, borderRadius: 10 }}
                  />
                ) : (
                  <Text style={styles.infoContent}>No data available.</Text>
                )}
                <Pressable style={styles.closeButton} onPress={closeInfoModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
    </>
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
