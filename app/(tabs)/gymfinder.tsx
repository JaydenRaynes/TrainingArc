import { Platform, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import useUserLocation from '../mapFunctions/userLocation'; // Custom hook for location fetching
import fetchNearbyGyms from '../mapFunctions/nearbyGyms'; // Function to fetch nearby gyms
import { Gym } from '../models/gymInfoModel'; // Your gym data model
import MapView, { Marker } from 'react-native-maps'; // Directly import MapView and Marker

interface Location {
  latitude: number;
  longitude: number;
}

const GymMapScreen: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]); // Array of gyms
  const [error, setError] = useState<string | null>(null);
  
  // Use your custom hook to get the user's location
  const { location, error: locationError } = useUserLocation();

  // Fetch nearby gyms once location is available
  useEffect(() => {
    if (location) {
      fetchNearbyGyms(location.latitude, location.longitude)
        .then(setGyms)
        .catch((err) => {
          setError('Failed to fetch gyms');
          console.error(err);
        });
    }
  }, [location]);

  // Handle errors like location fetching issues
  if (locationError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error fetching location: {locationError}</Text>
      </View>
    );
  }

  // Handle case where location is not yet available
  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  // Render the map regardless of whether there are gyms
  return (
    <MapView
      style={styles.map}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922, // Adjust zoom level
        longitudeDelta: 0.0421, // Adjust zoom level
      }}
    >
      {/* Marker for user's location */}
      <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
        <View style={styles.marker}>
          <Text style={styles.markerText}>You are here</Text>
        </View>
      </Marker>

      {/* Loop through gyms and display markers for each */}
      {gyms.length > 0 &&
        gyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.geometry.location.lat,
              longitude: gym.geometry.location.lng,
            }}
            title={gym.name}
            description={gym.vicinity} // or use any other property you want to show
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>{gym.name}</Text>
            </View>
          </Marker>
        ))}

      {/* Optionally, you can add a message if no gyms are found */}
      {gyms.length === 0 && (
        <View style={styles.center}>
          <Text>No gyms found nearby</Text>
        </View>
      )}
    </MapView>
  );
};

// Styles for the layout
const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  marker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)', // Add a shadow for better visibility
  },
  markerText: {
    fontSize: 12,
    color: '#333',
  },
});

export default GymMapScreen;
