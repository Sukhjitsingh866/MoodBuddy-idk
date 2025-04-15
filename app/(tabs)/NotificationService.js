import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export const setupNotifications = async () => {
  if (!Device.isDevice) {
    console.log("Notifications require a physical device.");
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
    },
  });

  if (status !== "granted") {
    console.log("Notification permissions denied.");
    return;
  }

  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const scheduleJournalReminder = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Journal!",
      body: "Reflect on your day with MoodBuddy. How are you feeling?",
      data: { screen: "Journal" }, // For navigation if needed
    },
    trigger: {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    },
  });
};