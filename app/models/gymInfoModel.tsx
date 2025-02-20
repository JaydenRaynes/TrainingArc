export interface Gym {
    name: string[];
    geometry: {
      location: {
        latitude: number;
        longitude: number;
      };
    };
    types: string[];
    vicinity: string;
    place_id: string;
    equipment: string[];
  }

          // console.log("Fetching gyms at location:", location);
        // fetchNearbyGyms(location.latitude, location.longitude)
        //   .then((data) => {
        //     const validGyms = data;
        //     console.log("Valid gyms:", validGyms);
        //     setGyms(validGyms);
        //   })
        //   .catch((err) => console.error("Error fetching gyms:", err));