export interface Biometric {
    age: string;
    gender: string;
    goal: string;
    height: string;
    weight: string;
    activityLevelB: string;
    preferences: {
      trainingType: string;
      cardioPreference: string;
      gymEquipment: boolean;
      focusAreas: string[];
    };
  }