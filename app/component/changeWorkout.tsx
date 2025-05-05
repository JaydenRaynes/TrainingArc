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
        {useAIWorkout ? "AI" : "Split"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'orange',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  toggleText: {
    color: theme.colors.buttonText,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
});

export default WorkoutSourceToggle;