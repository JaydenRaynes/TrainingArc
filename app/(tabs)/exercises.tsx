import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Exercise } from '../models/exerciseModel';
import { theme } from '../utils/theme';

const API_KEY = 'F1MrXYbs75rYDmGS8V9GQw==nADb7j66vFLL1qmo';

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(new Set()); // Track expanded instructions

  const fetchExercises = async (query: string) => {
    try {
      setLoading(true); // Show loading spinner
      const response = await axios.get('https://api.api-ninjas.com/v1/exercises', {
        headers: {
          'X-Api-Key': API_KEY,
        },
        params: {
          name: query,
        },
      });
      if (Array.isArray(response.data)) {
        setExercises(response.data);
      } else {
        setExercises([]);
      }
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
        onSubmitEditing={handleSearch} // Trigger search when pressing "Enter"
      />

      {/* Search Button */}
      <Button title="Search" onPress={handleSearch} color={theme.colors.primary} />

      {/* Display Exercises */}
      {exercises && exercises.length > 0 && (
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
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  searchBar: {
    height: 40,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  exerciseContainer: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  exerciseName: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  exerciseDetails: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    marginVertical: 2,
  },
  instructions: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    fontStyle: 'italic',
  },
  expandText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.primary,
    marginTop: theme.spacing.extraSmall,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: theme.fontSize.large,
    textAlign: 'center',
    marginTop: theme.spacing.large,
    color: theme.colors.primary,
  },
  errorText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: theme.spacing.large,
  },
  noResultsText: {
    fontSize: theme.fontSize.large,
    textAlign: 'center',
    color: theme.colors.warning,
    marginTop: theme.spacing.large,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Index;
