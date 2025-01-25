import React from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import { scheduleNotification } from "../utils/notifications";

export default function NotificationsSettings({ isNotificationsEnabled, setIsNotificationsEnabled }: any) {
  const handleNotificationToggle = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    if (value) {
      try {
        await scheduleNotification();
        Alert.alert("Success", "Notification scheduled!");
      } catch (error) {
        console.error("Error scheduling notification:", error);
        Alert.alert("Error", "Failed to schedule notification.");
      }
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.toggleContainer}>
        <Text>Enable Notifications</Text>
        <Switch value={isNotificationsEnabled} onValueChange={handleNotificationToggle} />
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
