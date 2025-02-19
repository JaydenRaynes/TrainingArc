import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import useUserLocation from '../mapFunctions/userLocation';
import fetchNearbyGyms from '../mapFunctions/nearbyGyms';
import { Gym } from '../models/gymInfoModel';

const GymMapScreen: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [currentGym, setCurrentGym] = useState<Gym | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [region, setRegion] = useState<any>(null);
  const { location, error: locationError } = useUserLocation();

  useFocusEffect(
    React.useCallback(() => {
      if (location) {
        console.log("Fetching gyms at location:", location);
        fetchNearbyGyms(location.latitude, location.longitude)
          .then((data) => {
            const validGyms = data.filter(gym => gym.geometry?.location?.latitude && gym.geometry?.location?.longitude);
            console.log("Valid gyms:", validGyms);
            setGyms(validGyms);
          })
          .catch((err) => console.error("Error fetching gyms:", err));
      }
    }, [location])
  );

  const handleSetCurrentGym = async (gym: Gym) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your data.");
      return;
    }
    try {
      const gymRef = doc(db, 'users', user.uid);
      await setDoc(gymRef, {
        name: gym.name,
        address: gym.vicinity,
        location: gym.geometry.location,
        types: gym.types,
        place_id: gym.place_id,
      });
      setCurrentGym(gym);
      Alert.alert('Success', 'Gym saved as current gym!');
    } catch (error) {
      console.error('Error saving gym to Firestore:', error);
      Alert.alert('Error', 'Failed to save gym.');
    }
  };

  const handleMarkerPress = (gym: Gym) => {
    setSelectedGym(gym);
    setRegion({
      latitude: gym.geometry.location.latitude,
      longitude: gym.geometry.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (locationError) {
    return (
      <View style={styles.center}><Text style={styles.errorText}>Error fetching location: {locationError}</Text></View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}><Text>Loading location...</Text></View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {currentGym && (
        <View style={styles.currentGymInfo}>
          <Text style={styles.currentGymText}>Current Gym:</Text>
          <Text style={styles.currentGymText}>{currentGym.name}</Text>
          <Text style={styles.currentGymText}>{currentGym.vicinity}</Text>
        </View>
      )}
      <MapView
        key={gyms.length} 
        style={styles.map}
        region={region || {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
          <MaterialCommunityIcons name="map-marker" size={40} color="white" />
        </Marker>

        {gyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.geometry.location.latitude || 0,
              longitude: gym.geometry.location.longitude || 0,
            }}
            onPress={() => handleMarkerPress(gym)}
          >
            <MaterialCommunityIcons name="map-marker" size={30} color="red" />
          </Marker>
        ))}
      </MapView>
      {selectedGym && (
        <View style={styles.gymPopup}>
          <Text style={styles.gymName}>{selectedGym.name}</Text>
          <Text style={styles.gymDetails}>{selectedGym.vicinity}</Text>
          <Text style={styles.gymDetails}>Type: {selectedGym.types.join(', ')}</Text>
          <TouchableOpacity style={styles.customButton} onPress={() => handleSetCurrentGym(selectedGym)}>
            <Text style={styles.buttonText}>Set as Current Gym</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  currentGymInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  currentGymText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  gymPopup: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gymDetails: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  customButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GymMapScreen;
