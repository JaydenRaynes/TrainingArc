import * as Notifications from "expo-notifications";

/**
 * Schedules a local notification.
 */
export const scheduleNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Workout Reminder",
        body: "It's time to work out and achieve your fitness goals!",
      },
      trigger: { 
        hour: 9,
        minute: 0,
        repeats: true, 
        type: "time" }, // Adjust as needed
    });
    console.log("Notification scheduled successfully.");
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw new Error("Failed to schedule notification.");
  }
};

export default scheduleNotification;