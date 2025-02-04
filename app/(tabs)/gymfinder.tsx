import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '../firebaseConfig'; // Assuming db is your Firestore instance
import { doc, setDoc } from 'firebase/firestore';
import useUserLocation from '../mapFunctions/userLocation';
import fetchNearbyGyms from '../mapFunctions/nearbyGyms';
import { Gym } from '../models/gymInfoModel';

interface Location {
  latitude: number;
  longitude: number;
}

const GymMapScreen: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [currentGym, setCurrentGym] = useState<Gym | null>(null);
  const [showInfo, setShowInfo] = useState<{ [key: number]: boolean }>({});
  const [region, setRegion] = useState<any>(null);
  const { location, error: locationError } = useUserLocation();

  useEffect(() => {
    if (location) {
      fetchNearbyGyms(location.latitude, location.longitude)
        .then(setGyms)
        .catch((err) => {
          console.error('Error fetching gyms:', err);
        });
    }
  }, [location]);

  const handleSetCurrentGym = async (gym: Gym) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }
    console.log(user);
    try {
      const gymRef = doc(db, 'gyms', user.uid); // Reference to the gym document
      await setDoc(gymRef, {
        name: gym.name,
        address: gym.vicinity,
        location: {
          latitude: gym.geometry.location.lat,
          longitude: gym.geometry.location.lng,
        },
        types: gym.types,
        place_id: gym.place_id,
      });
      setCurrentGym(gym); // Update the current gym state
      Alert.alert('Success', 'Gym saved as current gym!');
    } catch (error) {
      console.error('Error saving gym to Firestore:', error);
      Alert.alert('Error', 'Failed to save gym.');
    }
  };

  const toggleGymInfo = (index: number, gym: Gym) => {
    setShowInfo((prev) => ({ ...prev, [index]: !prev[index] }));
    setRegion({
      latitude: gym.geometry.location.lat,
      longitude: gym.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (locationError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error fetching location: {locationError}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      region={region || {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {/* Marker for user's location */}
      <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
        <View style={styles.userMarker}>
          <MaterialCommunityIcons name="account-circle" size={40} color="white" />
        </View>
      </Marker>

      {/* Gym markers */}
      {gyms.length > 0 &&
        gyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.geometry.location.lat,
              longitude: gym.geometry.location.lng,
            }}
            title={gym.name}
            description={gym.vicinity}
          >
            <View style={styles.gymMarker}>
              <TouchableOpacity onPress={() => toggleGymInfo(index, gym)}>
                <MaterialCommunityIcons name="exclamation-thick" size={30} color="red" />
              </TouchableOpacity>
              {showInfo[index] && (
                <View style={styles.gymInfo}>
                  <Text style={styles.gymMarkerText}>{gym.name}</Text>
                  <Text style={styles.gymMarkerText}>Address: {gym.vicinity}</Text>
                </View>
              )}

              {/* Always show the button if gym info is visible */}
              {showInfo[index] && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => handleSetCurrentGym(gym)}>
                    <Button title="Set as Current Gym" color="green" />
                </TouchableOpacity>
              </View>
              )}
              
            </View>
          </Marker>
        ))}

      {gyms.length === 0 && (
        <View style={styles.center}>
          <Text>No gyms found nearby</Text>
        </View>
      )}

      {/* Displaying the current gym info at the bottom of the map */}
      {currentGym && (
        <View style={styles.currentGymInfo}>
          <Text style={styles.currentGymText}>Current Gym:</Text>
          <Text style={styles.currentGymText}>Name: {currentGym.name}</Text>
          <Text style={styles.currentGymText}>Address: {currentGym.vicinity}</Text>
          <Text style={styles.currentGymText}>Type: {currentGym.types.join(', ')}</Text>
        </View>
      )}
    </MapView>
  );
};

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
  userMarker: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
  gymMarker: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
  gymInfo: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    width: 120,
    alignItems: 'center',
    position: 'absolute',
    top: 60,
  },
  gymMarkerText: {
    fontSize: 12,
    color: 'black',
  },
  currentGymInfo: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  currentGymText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    backgroundColor: 'white', // Solid white background for the button container
    padding: 10,              // Add some padding to give space around the button
    borderRadius: 8,          // Optional: round the corners
    width: 150,               // Control button width
    marginTop: 10,            // Add space between gym info and the button
    alignItems: 'center',     // Center the button horizontally
    color: 'black',
  },
});

export default GymMapScreen;
