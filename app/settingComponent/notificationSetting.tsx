import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { scheduleNotification, requestNotificationPermission, sendTestNotification } from "../utils/notifications";

export default function NotificationsSettings({ isNotificationsEnabled, setIsNotificationsEnabled }: any) { 
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setIsNotificationsEnabled(false);
      }
    };
    checkPermissions();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    setIsNotificationsEnabled(value);

    if (value) {
      setLoading(true);
      try {
        if (!selectedTime) {
          setSelectedTime(new Date());
          Alert.alert("Time Selected", "Defaulting to the current time.");
        }
        await scheduleNotification(selectedTime || new Date());
        Alert.alert("Success", "Notification scheduled!");
      } catch (error) {
        Alert.alert("Error", "Failed to schedule notification.");
        setIsNotificationsEnabled(false);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Notifications Disabled", "You will no longer receive reminders.");
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.toggleContainer}>
        <Text style={styles.text}>Enable Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={handleNotificationToggle}
          disabled={loading}
          trackColor={{ false: "#767577", true: "#FFA500" }}
          thumbColor={isNotificationsEnabled ? "#FFA500" : "#f4f3f4"}
        />
      </View>

      {isNotificationsEnabled && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
            <Text style={styles.buttonText}>Select Notification Time</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="spinner"
              onChange={(event, date) => {
                setShowPicker(false);
                if (date) {
                  setSelectedTime(date);
                }
              }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
            <Text style={styles.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && <Text style={styles.loadingText}>Scheduling...</Text>}
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFA500",
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
  },

  text: {
    color: "#FFFFFF",
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: "center",
  },

  buttonText: { fontSize: 16, fontWeight: "bold", color: "#0D0D0D" },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
