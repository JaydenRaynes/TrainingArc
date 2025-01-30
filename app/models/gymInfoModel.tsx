export interface Gym {
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    vicinity: string;
  }