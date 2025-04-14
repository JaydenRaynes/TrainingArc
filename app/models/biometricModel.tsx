// export interface Biometric {
//     age: string;
//     gender: string;
//     goal: string;
//     height: string;
//     weight: string;
//     activityLevelB: string;
//     preferences: {
//       trainingType: string;
//       cardioPreference: string;
//       gymEquipment: boolean;
//       focusAreas: string[];
//     };
//   }

export interface Biometric {
  age: number;
  height: string; // e.g., "180 cm" or "5'11\""
  weight: string; // e.g., "70 kg" or "154 lbs"
  timesPerWeek: string; // e.g., "1-2", "3-4", "5+"
  fitnessGoal: string;
  experienceLevel: string;
  limitations?: string; // optional text
  workoutPreference: string;
  biometricsComplete: boolean;
}
