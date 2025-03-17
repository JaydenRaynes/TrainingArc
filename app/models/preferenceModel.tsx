export interface Preferences {
    age: string;
    gender: string;
    height: string;
    weight: string;
    fitnessLevel: string;
    disabilities: string;
    conditions: string;
    injuries: string;
    fitnessGoal: string;
    workoutFrequency: string;
    workoutDuration: string;
    intensityPreference: string;
    equipmentPreference: {
      dumbbells: boolean;
      barbells: boolean;
      kettlebells: boolean;
      resistanceBands: boolean;
      none: boolean;
    };
    preferredWorkoutType: {
      cardio: boolean;
      strength: boolean;
      yoga: boolean;
      hiit: boolean;
      bodyweight: boolean;
    };
    workoutEnvironment: {
      home: boolean;
      gym: boolean;
      outdoor: boolean;
    };
    cardioPreferences: {
      running: boolean;
      cycling: boolean;
      swimming: boolean;
      rowing: boolean;
      walking: boolean;
    };
    activityLevel: {
      active: boolean;
      slightlyActive: boolean;
      notActive: boolean;
    };
    timeOfDayPreference: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
      night: boolean;
      any: boolean;
    };
    workoutSplit: {
      fullBody: boolean;
      weeklySplit: boolean;
      targeted: boolean;
    };
  }
  