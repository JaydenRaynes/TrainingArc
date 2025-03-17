import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleNotification = async (selectedTime?: Date): Promise<void> => {
  try {
    if (!selectedTime) {
      throw new Error("Selected time is undefined.");
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert("Permission Required", "Enable notifications in settings.");
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync(); // Avoid duplicates

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Workout Reminder",
        body: "It's time to work out and achieve your fitness goals!",
      },
      trigger: {
        hour: selectedTime.getHours(),
        minute: selectedTime.getMinutes(),
        repeats: true,
      },
    });

    console.log("Notification scheduled at:", selectedTime);
  } catch (error) {
    console.error("Error scheduling notification:", error);
    Alert.alert("Error", "Failed to schedule notification.");
  }
};

/**
 * Sends an immediate test notification.
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    console.log("sending text notificationnnnn")
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test!",
      },
      trigger: null, // Immediate notification
    });

    Alert.alert("Success", "Test notification sent!");
  } catch (error) {
    console.error("Error sending test notification:", error);
    Alert.alert("Error", "Failed to send test notification.");
  }
};

export default {};