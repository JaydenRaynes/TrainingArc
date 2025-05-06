import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { scheduleNotification, requestNotificationPermission, sendTestNotification } from "../utils/notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsSettings({ isNotificationsEnabled, setIsNotificationsEnabled }: any) { 
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const savedTime = await AsyncStorage.getItem("selected_notification_time");
      if (savedTime) {
        setSelectedTime(new Date(savedTime));
      }
  
      const savedToggle = await AsyncStorage.getItem("notifications_enabled");
      if (savedToggle !== null) {
        setIsNotificationsEnabled(savedToggle === "true");
      }
  
      const granted = await requestNotificationPermission();
      if (!granted) {
        setIsNotificationsEnabled(false);
      }
    };
  
    loadState();
  }, []);
  

  const handleNotificationToggle = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    await AsyncStorage.setItem("notifications_enabled", value.toString());
  
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
      <View style={styles.dropdownHeader}>
        <Text style={styles.sectionTitle}>Notifications</Text>
      </View>
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
              onChange={async (event, date) => {
                setShowPicker(false);
                if (date) {
                  setSelectedTime(date);
                  await AsyncStorage.setItem("selected_notification_time", date.toISOString());
                  await scheduleNotification(date);
                  Alert.alert("Notification Updated", "Reminder time has been updated!");
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFA500",
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sectionTitle: {
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFA500"
   },
  toggleIcon: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFA500" 
  },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 10,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#0D0D0D" 
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    paddingHorizontal: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  text: {
    color: "#FFFFFF",
  },
});
