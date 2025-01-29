import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const exercises = [
  { id: '1', name: 'Bench Press', bestSet: '225 x 5', estimatedMax: '255 lbs' },
  { id: '2', name: 'Squat', bestSet: '315 x 3', estimatedMax: '345 lbs' },
  { id: '3', name: 'Deadlift', bestSet: '405 x 2', estimatedMax: '435 lbs' },
  { id: '4', name: 'Overhead Press', bestSet: '135 x 5', estimatedMax: '155 lbs' },
];

const App = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

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
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              {/* Info Button in Top Right */}
              <Pressable style={styles.infoButton} onPress={() => openInfoModal(exercise)}>
                <Text style={styles.infoButtonText}>i</Text>
              </Pressable>

              <Text style={styles.titleText}>{exercise.name}</Text>
              <Text style={styles.subtitleText}>Best Set: {exercise.bestSet}</Text>
              <Text style={styles.subtitleText}>Estimated Max: {exercise.estimatedMax}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Exercise Info Modal */}
        <Modal transparent={true} visible={infoVisible} animationType="fade">
          <TouchableWithoutFeedback onPress={closeInfoModal}>
            <View style={styles.infoModalBackground}>
              <View style={styles.infoModalView}>
                <Text style={styles.infoTitle}>
                  {selectedExercise?.name} Info
                </Text>
                <Text style={styles.infoContent}>
                  Best Set: {selectedExercise?.bestSet}
                </Text>
                <Text style={styles.infoContent}>
                  Estimated Max: {selectedExercise?.estimatedMax}
                </Text>
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
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15, // Adds space between each card
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
  // Info Button Styling
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
  // Info Modal Styles
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

export default App;
