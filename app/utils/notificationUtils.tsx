// app/utils/notificationUtils.tsx
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Global variables to track listeners and current time
let reschedulingListener: { remove: () => void } | null = null;
let currentNotificationTime: { hour: number; minute: number } | null = null;
let isRescheduling = false;
let lastRescheduleTime = 0;
const RESCHEDULE_DEBOUNCE_MS = 5000; // 5 seconds debounce
let notificationFireCount = 0; // Count notifications fired
let notificationTimeout: NodeJS.Timeout | null = null; // Track the timeout

export async function setupNotifications() {
  console.log('Setting up notifications...');

  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cleared all scheduled notifications at startup');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Current notification permissions:', existingStatus);

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Requested notification permissions, new status:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions!');
      return null;
    }

    console.log('Skipping push token generation (no projectId available). Local notifications may still work in the foreground.');
    return true;
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  if (Platform.OS === 'android') {
    console.log('Setting up Android notification channel');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function scheduleDailyReminder(time: { hour: number; minute: number }) {
  console.log('scheduleDailyReminder called with time:', time);

  // Clear any existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cleared all previous scheduled notifications');

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  console.log(`Current device time: ${now.toLocaleString()} (Hour: ${currentHour}, Minute: ${currentMinute})`);
  console.log(`Device time zone offset (minutes): ${now.getTimezoneOffset()}`);

  const nextNotification = new Date();
  nextNotification.setHours(time.hour, time.minute, 0, 0);

  const isPast = nextNotification.getTime() <= now.getTime();
  console.log(`Is scheduled time (${time.hour}:${time.minute}) in the past? ${isPast}`);

  if (isPast) {
    console.log('Scheduled time is in the past for today, moving to tomorrow');
    nextNotification.setDate(nextNotification.getDate() + 1);
  }

  const millisecondsUntilNotification = nextNotification.getTime() - now.getTime();
  const secondsUntilNotification = Math.max(60, Math.floor(millisecondsUntilNotification / 1000)); // Minimum 60 seconds
  console.log(`Milliseconds until notification: ${millisecondsUntilNotification}`);

  try {
    // Use setTimeout to delay the notification display
    notificationTimeout = setTimeout(async () => {
      notificationFireCount += 1;
      console.log(`Notification fired (${notificationFireCount} total) at:`, new Date().toLocaleString());
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodBuddy Reminder 🌟",
          body: "Don't forget to check in with MoodBuddy today!",
          data: { screen: 'journal' },
        },
        trigger: {
          seconds: 1, // Minimal delay to ensure it fires immediately after the timeout
        },
      });
      console.log(`Successfully displayed reminder for ${nextNotification.toLocaleString()}`);

      // Trigger rescheduling after the notification fires
      if (currentNotificationTime) {
        const now = Date.now();
        if (now - lastRescheduleTime < RESCHEDULE_DEBOUNCE_MS) {
          console.log('Debouncing reschedule, too soon');
          return;
        }
        if (isRescheduling) {
          console.log('Already rescheduling, skipping to avoid loop');
          return;
        }

        isRescheduling = true;
        lastRescheduleTime = now;
        if (reschedulingListener) {
          reschedulingListener.remove();
          reschedulingListener = null;
        }
        console.log('Rescheduling notification for the next day');
        await scheduleDailyReminder(currentNotificationTime);
        setupNotificationRescheduling();
        isRescheduling = false;
      } else {
        console.log('No notification time available, cannot reschedule');
      }
    }, millisecondsUntilNotification);

    console.log(`Scheduled one-time reminder for ${nextNotification.toLocaleString()} (in ${secondsUntilNotification} seconds)`);
    currentNotificationTime = time;
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export function setupNotificationRescheduling() {
  // Rescheduling is now handled directly in scheduleDailyReminder
  console.log('Rescheduling listener setup is disabled; rescheduling handled in scheduleDailyReminder');
  return () => {};
}

export function setupNotificationListener(navigation: any) {
  console.log('Setting up navigation listener for notification taps');
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const screen = response.notification.request.content.data?.screen;
    if (screen) {
      console.log(`Notification tapped, navigating to screen: ${screen}`);
      navigation.navigate(screen);
    } else {
      console.log('Notification tapped, but no screen specified in data');
    }
  });

  return () => {
    console.log('Cleaning up navigation listener');
    subscription.remove();
  };
}

export function clearNotificationRescheduling() {
  if (reschedulingListener) {
    console.log('Clearing rescheduling listener');
    reschedulingListener.remove();
    reschedulingListener = null;
  }
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  currentNotificationTime = null;
}