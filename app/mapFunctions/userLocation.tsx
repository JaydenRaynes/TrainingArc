import { useEffect, useState } from 'react';
import * as Location from 'expo-location';  // Import expo-location

interface LocationType {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  location: LocationType | null;
  error: string | null;
}

export const useUserLocation = (): UseUserLocationResult => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync(); // Request permission
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      try {
        const userLocation = await Location.getCurrentPositionAsync({});  // Get current position
        setLocation(userLocation.coords);
      } catch (err) {
        setError('Failed to fetch location');
        console.error(err);
      }
    };

    getLocation();
  }, []);

  return { location, error };
};

export default useUserLocation;
