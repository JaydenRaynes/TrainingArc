export interface Biometric {
  age: number;
  height: string;
  weight: string;
  timesPerWeek: string;
  daysPreference: string[];
  fitnessGoal: string;
  experienceLevel: string;
  limitations?: string; // optional text
  workoutPreference: string;
  equipmentPreference: string[];
  biometricsComplete: boolean;
  workoutGroupPreference: string[];
}
