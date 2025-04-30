import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

export const scheduleNotification = async (selectedTime?: Date): Promise<void> => {
  try {
    if (!selectedTime) throw new Error("No time selected");

    const now = new Date();
    let scheduledTime = new Date(selectedTime);
    scheduledTime.setSeconds(0); // optional, for consistency

    // If selected time is earlier than now, schedule for next day
    if (
      scheduledTime.getHours() < now.getHours() ||
      (scheduledTime.getHours() === now.getHours() && scheduledTime.getMinutes() <= now.getMinutes())
    ) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await Notifications.cancelAllScheduledNotificationsAsync(); // avoid duplicates

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Workout Reminder",
        body: "It's time to work out and achieve your fitness goals!",
      },
      trigger: scheduledTime, // <-- pass full Date object
    });

    console.log("Notification scheduled for:", scheduledTime);
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