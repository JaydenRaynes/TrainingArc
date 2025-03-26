import { Exercise } from "./exerciseModel";

export interface Split {
    days: WorkoutDay[];
}

export interface WorkoutDay {
    day: string;
    exercises: Exercise[];
}
