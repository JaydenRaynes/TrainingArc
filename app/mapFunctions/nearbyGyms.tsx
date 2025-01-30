import axios from 'axios';
import { Gym } from '../models/gymInfoModel';

export const fetchNearbyGyms = async (latitude: number, longitude: number): Promise<Gym[]> => {
    console.log(latitude);
    console.log(longitude);
    const apiKey = 'AIzaSyDkm7LX01BhG46JQsWsQQ4RRN2NO9OjmB0'; // Replace with your actual Google API key
    const radius = 5000; // Search within 5 km
    const type = 'gym';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
  
    try {
      const response = await axios.get(url);
      return response.data.results as Gym[]; // Cast response to Gym type
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  
  export default fetchNearbyGyms;