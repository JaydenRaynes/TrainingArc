import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
    location: Location | null;
    error: string | null;
  }

export const useUserLocation = (): UseUserLocationResult => {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const getLocation = () => {
        Geolocation.getCurrentPosition(
          (position) => {
            setLocation({
            //   latitude: position.coords.latitude,
            //   longitude: position.coords.longitude,
            latitude: 32.5232,
            longitude: 92.6379,
            });
          },
          (err) => {
            setError(err.message);
          }
        );
      };

      getLocation();
    }, []);

  return { location, error };
};

export default useUserLocation;
