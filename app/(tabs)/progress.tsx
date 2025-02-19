import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
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
        const workoutData = querySnapshot.docs.map(doc => doc.data());
        const groupedWorkouts = {};

        workoutData.forEach(workout => {
          const { workoutName, date } = workout;
          if (!groupedWorkouts[workoutName] || new Date(date) > new Date(groupedWorkouts[workoutName].date)) {
            groupedWorkouts[workoutName] = workout;
          }
        });

        setWorkouts(Object.values(groupedWorkouts));
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

  const fetchExerciseHistory = (exerciseName) => {
    const userID = auth.currentUser?.uid;
    if (!userID) return;

    const progressRef = collection(db, "users", userID, "progress");
    const q = query(progressRef, where("workoutName", "==", exerciseName), orderBy("date", "asc"));

    onSnapshot(q, (querySnapshot) => {
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date,
          maxRep: Math.round(data.weight * (1 + data.reps / 30)),
        };
      });
      setExerciseHistory(history);
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Workout Progress</Text>
          {workouts.length > 0 ? (
            workouts.map((workout, index) => {
              const bestSet = `${workout.reps} reps of ${workout.weight} lbs`;
              const estimatedMax = `1 rep of ${Math.round(workout.weight * (1 + workout.reps / 30))} lbs`;

              return (
                <View key={index} style={styles.exerciseCard}>
                  <Pressable style={styles.infoButton} onPress={() => openInfoModal(workout)}>
                    <Text style={styles.infoButtonText}>i</Text>
                  </Pressable>
                  <Text style={styles.titleText}>{workout.workoutName}</Text>
                  <Text style={styles.subtitleText}>Best Set of Reps: {bestSet}</Text>
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
