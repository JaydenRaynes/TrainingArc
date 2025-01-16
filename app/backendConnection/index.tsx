import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import axios from 'axios';
import { Exercise } from '../models/exerciseModel';

const Index = () => {
    // Update state to store an array of exercises
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      // Fetch exercises from the backend
      const fetchExercises = async () => {
        try {
          const response = await axios.get('http://localhost:5000/');
          setExercises(response.data.exercise); // Assuming response.data contains an "exercise" array
        } catch (error) {
          setError('Failed to fetch exercises');
        } finally {
          setLoading(false);
        }
      };
  
      fetchExercises();
    }, []);
  
    if (loading) {
      return <Text>Loading...</Text>;
    }
  
    if (error) {
      return <Text>{error}</Text>;
    }
  
    return (
      <View>
        <Text>Exercises:</Text>
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              <Text>Name: {item.name}</Text>
              <Text>Target Muscle: {item.muscle}</Text>
            </View>
          )}
        />
      </View>
    );
  };
  
  export default Index;