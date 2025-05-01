import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../utils/theme";

type Props = {
  useAIWorkout: boolean;
  setUseAIWorkout: (value: boolean) => void;
};

const WorkoutSourceToggle: React.FC<Props> = ({ useAIWorkout, setUseAIWorkout }) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: useAIWorkout ? theme.colors.primary : theme.colors.primary,
        },
      ]}
      onPress={() => setUseAIWorkout(prev => !prev)}
    >
      <Text style={styles.toggleText}>
        {useAIWorkout
          ? "Using: AI Workout (Switch to My Plan)"
          : "Using: My Plan (Switch to AI Workout)"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  toggleText: {
    color: theme.colors.buttonText,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
});

export default WorkoutSourceToggle;