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
        <Text>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={handleDarkModeToggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});


