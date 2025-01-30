import { useEffect, useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  return location;
};

export default useUserLocation;
