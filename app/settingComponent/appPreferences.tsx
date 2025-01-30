import React from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import { toggleDarkMode } from "../utils/appPreferences";

export default function AppPreferences({ isDarkMode, setIsDarkMode }: any) {
  const handleDarkModeToggle = async (value: boolean) => {
    try {
      setIsDarkMode(value);
      await toggleDarkMode(value);
      Alert.alert("Success", `Dark mode ${value ? "enabled" : "disabled"}!`);
    } catch (error) {
      console.error("Error updating dark mode:", error);
      Alert.alert("Error", "Failed to update dark mode preference.");
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Preferences</Text>
      <View style={styles.toggleContainer}>
        <Text style={styles.text}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={handleDarkModeToggle}
          trackColor={{ false: "#767577", true: "#FFA500" }}
          thumbColor={isDarkMode ? "#FFA500" : "#f4f3f4"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#191a2f", 
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFA500", 
    backgroundColor: "#000000", 
    borderRadius: 50,
    padding: 10,
  },

  text: {
    color: "#FFFFFF", 
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
