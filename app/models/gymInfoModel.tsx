export interface Gym {
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
    vicinity: string;
    place_id: string;
  }