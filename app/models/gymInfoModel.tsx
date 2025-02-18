export interface Gym {
    name: string;
    geometry: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
    types: string[];
    vicinity: string;
    place_id: string;
  }