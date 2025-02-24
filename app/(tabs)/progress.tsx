import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';

const ProgressPage = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);

  useEffect(() => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;
  
    const progressRef = collection(db, "users", userID, "progress");
    const q = query(progressRef, orderBy("date", "desc"));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const groupedWorkouts = [];
  
        querySnapshot.forEach(docSnap => {
          const docData = docSnap.data();
          console.log('Document Data:', docData); // Log to inspect the document
  
          // Flatten exercises from the "workouts" array and map them
          docData.workouts.forEach(exercise => {
            console.log('Exercise:', exercise); // Log to inspect individual exercises
  
            const { workoutName, sets, reps, weight, date } = exercise;
  
            // Safely handle missing or malformed data
            const safeSets = sets ? sets : 0;
            const safeReps = reps ? reps : 0;
            const safeWeight = weight ? weight : 0;
            const safeDate = date ? date : 'Unknown Date';
  
            groupedWorkouts.push({
              workoutName: workoutName || 'Unnamed Exercise',
              sets: safeSets,
              reps: safeReps,
              weight: safeWeight,
              date: safeDate,
            });
          });
        });
  
        setWorkouts(groupedWorkouts); // Update workouts for display
      } else {
        setWorkouts([]);
      }
    }, (error) => {
      console.error("Error fetching workout data:", error);
    });
  
    return () => unsubscribe();
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
    if (!userID) return;
  
    const progressRef = collection(db, "users", userID, "progress");
    const querySnapshot = await getDocs(progressRef);
  
    const history = [];
    querySnapshot.forEach(docSnap => {
      const docData = docSnap.data();
      console.log('Document Data:', docData); // Log the full document data
  
      // Iterate over the "workouts" array to access each workout object
      docData.workouts.forEach(exercise => {
        console.log('Exercise Data:', exercise); // Log each exercise data
  
        const { workoutName, weight, reps, date } = exercise;
  
        // Only proceed if this exercise matches the selected exercise name
        if (workoutName === exerciseName) {
          // Convert reps and weight to numbers before using them
          const numWeight = parseFloat(weight) || 0;
          const numReps = parseInt(reps) || 0;
  
          history.push({
            date: date, // Add date if needed
            maxRep: numWeight && numReps ? Math.round(numWeight * (1 + numReps / 30)) : 0, // Safely calculate maxRep
          });
        }
      });
    });
  
    if (history.length === 0) {
      console.log("No data found for this exercise.");
    }
  
    setExerciseHistory(history); // Update state with filtered history
  };
  
  
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Workout Progress</Text>
          {workouts.length > 0 ? (
            workouts.map((workout, index) => {
              const bestSet = `${workout.sets}x${workout.reps} @ ${workout.weight} lbs`;
              const estimatedMax = `1 rep of ${Math.round(workout.weight * (1 + workout.reps / 30))} lbs`;

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
