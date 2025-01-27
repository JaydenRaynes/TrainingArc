import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Exercise } from '../models/exerciseModel';

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set()); // Track expanded instructions

  const fetchExercises = async (query: string) => {
    try {
      setLoading(true); // Show loading spinner
      const response = await axios.get('http://localhost:5000/', {
        params: {
          name: query, // Pass search term to backend
        },
      });
      setExercises(response.data.exercises); // Set exercises from API response
    } catch (error) {
      setError('Failed to fetch exercises');
      console.error(error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      fetchExercises(searchTerm); // Fetch exercises when user clicks search button
    }
  };

  const handleEnterPress = (e: any) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      fetchExercises(searchTerm); // Fetch exercises when user presses Enter
    }
  };

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

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Exercises:</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search exercises..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleEnterPress} // Trigger search when pressing "Enter"
      />

      {/* Search Button */}
      <Button title="Search" onPress={handleSearch} />

      {/* Display Exercises */}
      {exercises.length > 0 && (
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>Target Muscle: {item.muscle}</Text>
              <Text style={styles.exerciseDetails}>Type: {item.type}</Text>
              <Text style={styles.exerciseDetails}>Equipment: {item.equipment}</Text>
              <Text style={styles.exerciseDetails}>Difficulty: {item.difficulty}</Text>

              {/* Instructions: Show a truncated version initially, with a "..." button to expand */}
              <View>
                <Text
                  style={styles.instructions}
                  numberOfLines={expandedInstructions.has(index) ? undefined : 2}
                >
                  {item.instructions || 'No instructions available'}
                </Text>
                {item.instructions && (
                  <TouchableOpacity onPress={() => toggleInstructions(index)}>
                    <Text style={styles.expandText}>
                      {expandedInstructions.has(index) ? 'Show Less' : '...'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Show "No exercises found" message only if search term is not empty and no exercises are found */}
      {exercises.length === 0 && searchTerm.trim() !== '' && (
        <Text style={styles.noResultsText}>No exercises found for "{searchTerm}"</Text>
      )}
    </ScrollView>
  );
};

// Styles for the layout
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  exerciseContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#555',
    marginVertical: 2,
  },
  instructions: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    fontStyle: 'italic',
  },
  expandText: {
    fontSize: 14,
    color: '#007BFF',
    marginTop: 5,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Index;
