import { Platform, View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import useUserLocation from '../mapFunctions/userLocation';
import fetchNearbyGyms from '../mapFunctions/nearbyGyms';
import { Gym } from '../models/gymInfoModel';
import MapView, { Marker } from 'react-native-maps'; // Directly import from react-native-maps

interface Location {
  latitude: number;
  longitude: number;
}

const GymMapScreen: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    // If location is available, fetch nearby gyms
    if (location) {
      fetchNearbyGyms(location.latitude, location.longitude).then(setGyms);
    }
  }, [location]);

  if (!location) {
    return (
      <View>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922, // Adjust zoom level as needed
        longitudeDelta: 0.0421, // Adjust zoom level as needed
      }}
    >
      {gyms.map((gym: Gym, index: number) => (
        <Marker
          key={index}
          coordinate={{
            latitude: gym.geometry.location.lat,
            longitude: gym.geometry.location.lng,
          }}
        >
          <View>
            <Text>{gym.name}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

export default GymMapScreen;
