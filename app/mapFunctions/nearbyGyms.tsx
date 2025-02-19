import axios from 'axios';
import { Gym } from '../models/gymInfoModel';

export const fetchNearbyGyms = async (latitude: number, longitude: number): Promise<Gym[]> => {
    console.log(latitude);
    console.log(longitude);
    const apiKey = 'AIzaSyDkm7LX01BhG46JQsWsQQ4RRN2NO9OjmB0'; // Replace with your actual Google API key
    const radius = 5000; // Search within 5 km
    const types = ['gym', 'fitness_center', 'health'];
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&types=${types.join('|')}&key=${apiKey}`;
  
    try {
      const response = await axios.get(url);
      const gyms = response.data.results.filter((place: any) => place.name.toLowerCase().includes('gym'));
      return gyms as Gym[]; // Cast response to Gym type
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  
  export default fetchNearbyGyms;