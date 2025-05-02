import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import useUserLocation from '../mapFunctions/userLocation';
import fetchNearbyGyms from '../mapFunctions/nearbyGyms';
import { Gym } from '../models/gymInfoModel';

const GymMapScreen: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [currentGym, setCurrentGym] = useState<Gym | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [region, setRegion] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false); // Manage visibility of the popup
  const { location, error: locationError } = useUserLocation();

  const mapRef = React.useRef<MapView>(null);

  useFocusEffect(
    useCallback(() => {
      if (location) {
        // Your test gym data here
        const testGym: Gym[] = [{
          "name": ["Planet Fitness"],
          "geometry": {
            "location": {
              "latitude": 32.543000,
              "longitude": -92.637500
            }
          },
          "types": ["gym", "health", "fitness", "point_of_interest"],
          "vicinity": "123 Example St, Ruston, LA 10001",
          "place_id": "testGym",
          "equipment": [
            "Treadmills",
            "Ellipticals",
            "Stationary Bikes",
            "Free Weights",
            "Dumbbells",
            "Barbells",
            "Weight Machines",
            "Cable Machines",
            "Smith Machines",
            "Leg Press Machines",
            "Chest Press Machines",
            "Lat Pulldown Machines",
            "Ab Crunch Machines",
            "Seated Row Machines",
            "Resistance Bands",
            "Kettlebells",
            "Medicine Balls",
            "Battle Ropes",
            "Exercise Balls",
            "Stretching Mats"]
        },
        {
          "name": ["Iron Haven Gym"],
          "geometry": {
            "location": {
              "latitude": 32.530200,
              "longitude": -92.635800
            }
          },
          "types": ["gym", "fitness", "point_of_interest"],
          "vicinity": "456 Fitness Blvd, Ruston, LA 10002",
          "place_id": "ironHavenGym",
          "equipment": [
            "Treadmills",
            "Ellipticals",
            "Stationary Bikes",
            "Free Weights",
            "Dumbbells",
            "Barbells",
            "Power Racks",
            "Deadlift Platforms",
            "Leg Press Machines",
            "Bench Press Stations",
            "Rowing Machines",
            "Sled Push Tracks",
            "Kettlebells",
            "Medicine Balls",
            "Battle Ropes",
            "TRX Suspension Trainers",
            "Plyometric Boxes",
            "Resistance Bands"
          ]
        },
        {
          "name": ["Ruston Athletic Club"],
          "geometry": {
            "location": {
              "latitude": 32.541500,
              "longitude": -92.668900
            }
          },
          "types": ["gym", "sports_club", "point_of_interest"],
          "vicinity": "789 Strength St, Ruston, LA 10003",
          "place_id": "rustonAthleticClub",
          "equipment": [
            "Treadmills",
            "Ellipticals",
            "Rowing Machines",
            "Dumbbells",
            "Barbells",
            "Weight Machines",
            "Resistance Bands",
            "Squat Racks",
            "Deadlift Platforms",
            "Battle Ropes",
            "Spin Bikes",
            "Plyometric Boxes",
            "Sled Push Tracks",
            "Stretching Mats",
            "Jump Ropes",
            "Foam Rollers",
            "Cable Machines"
          ]
        },
        {
          "name": ["Elite Performance Center"],
          "geometry": {
            "location": {
              "latitude": 32.548800,
              "longitude": -92.640300
            }
          },
          "types": ["gym", "personal_training", "point_of_interest"],
          "vicinity": "321 Powerhouse Ln, Ruston, LA 10004",
          "place_id": "elitePerformanceCenter",
          "equipment": [
            "Treadmills",
            "Ellipticals",
            "Assault Bikes",
            "Free Weights",
            "Dumbbells",
            "Barbells",
            "Weight Machines",
            "Cable Machines",
            "Squat Racks",
            "Plyometric Boxes",
            "Sled Push Tracks",
            "TRX Suspension Trainers",
            "Battle Ropes",
            "Kettlebells",
            "Medicine Balls",
            "Foam Rollers",
            "Stretching Mats",
            "Gymnastics Rings",
            "Pull-Up Bars"
            ]
          }
        ];
        setGyms(testGym);
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
      const userRef = doc(db, 'users', user.uid, 'gym', gym.place_id);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.log("Gym does not exist, creating...");
      } else {
        console.log("Gym already exists, updating...");
      }

      await setDoc(userRef, {
        name: gym.name,
        address: gym.vicinity,
        location: gym.geometry.location,
        types: gym.types,
        place_id: gym.place_id,
        equipment: gym.equipment,
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
    setPopupVisible(true); // Show the popup when a gym marker is pressed
    mapRef.current?.animateToRegion({
      latitude: gym.geometry.location.latitude,
      longitude: gym.geometry.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setPopupVisible(true); // Show the popup when a gym marker is pressed
  };

  const handleClosePopup = () => {
    setPopupVisible(false); // Close the popup when clicking outside
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

  // Log selectedGym to make sure it gets updated
  console.log("Selected Gym: ", selectedGym);

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
        ref={mapRef}
        key={gyms.length} 
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        showsUserLocation={true}
        
      >
        
        {/* <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
          <MaterialCommunityIcons name="map-marker" size={40} color="white" />
        </Marker> */}

        {gyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.geometry.location.latitude || 0,
              longitude: gym.geometry.location.longitude || 0,
            }}
            onPress={() => handleMarkerPress(gym)}
          >
            <MaterialCommunityIcons name="dumbbell" size={40} color="white" />
          </Marker>
        ))}
      </MapView>

      {/* TouchableWithoutFeedback to close popup when clicking outside */}
      {popupVisible && (
        <TouchableWithoutFeedback onPress={handleClosePopup}>
          <View style={styles.gymPopupOverlay} />
        </TouchableWithoutFeedback>
      )}

      {popupVisible && selectedGym && (
        <View style={styles.gymPopup}>
          <Text style={styles.gymName}>{selectedGym.name}</Text>
          <Text style={styles.gymDetails}>{selectedGym.vicinity}</Text>
          <Text style={styles.gymDetails}>Type: {selectedGym.types.join(', ')}</Text>
          
          {/* Display the gym's equipment */}
          <View style={styles.equipmentContainer}>
            <Text style={styles.equipmentTitle}>Equipment:</Text>
            <ScrollView style={styles.equipmentList}>
              {selectedGym.equipment.map((item, index) => (
                <Text key={index} style={styles.equipmentItem}>{item}</Text>
              ))}
            </ScrollView>
          </View>

          {/* Save gym button */}
          <TouchableOpacity style={styles.customButton} onPress={() => handleSetCurrentGym(selectedGym)}>
            <Text style={styles.buttonText}>Save Gym</Text>
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
  gymPopupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Transparent overlay
  },
gymPopup: {
  position: 'absolute',
  bottom: 0,  // Attach to very bottom
  left: 0,
  right: 0,
  backgroundColor: 'white',
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  maxHeight: '50%',
},
gymName: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#222',
  textAlign: 'center',
  marginBottom: 8,
},
  gymDetails: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
    marginVertical: 2,
  },
  equipmentContainer: {
    marginVertical: 10,
    width: '100%',
  },
  equipmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
  },
  equipmentList: {
    maxHeight: 150,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  equipmentItem: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  customButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',        // Full width
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GymMapScreen;
