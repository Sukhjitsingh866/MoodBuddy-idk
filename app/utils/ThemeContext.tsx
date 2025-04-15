// app/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDailyReminder, clearNotificationRescheduling } from './notificationUtils';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

type Theme = 'light' | 'dark';

interface NotificationTime {
  hour: number;
  minute: number;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationTime: NotificationTime;
  setNotificationTime: (time: NotificationTime) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  notificationTime: { hour: 20, minute: 0 },
  setNotificationTime: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationTime, setNotificationTime] = useState<NotificationTime>({ hour: 20, minute: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setTheme(profile.theme || 'dark');
          setNotificationsEnabled(profile.notifications ?? true);
          setNotificationTime(profile.notificationTime || { hour: 20, minute: 0 });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const updateTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      const storedProfile = await AsyncStorage.getItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', notifications: notificationsEnabled, notificationTime };
      const updatedProfile = { ...profile, theme: newTheme };
      await AsyncStorage.setItem('@profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateNotificationsEnabled = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      const storedProfile = await AsyncStorage.getItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', theme, notificationTime };
      const updatedProfile = { ...profile, notifications: enabled };
      await AsyncStorage.setItem('@profile', JSON.stringify(updatedProfile));

      if (enabled) {
        await scheduleDailyReminder(notificationTime);
        Alert.alert('Notifications Enabled', `You will receive daily reminders at ${formatTime(notificationTime)}.`);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        clearNotificationRescheduling();
        Alert.alert('Notifications Disabled', 'All scheduled reminders have been canceled.');
      }
    } catch (error) {
      console.error('Error updating notifications setting:', error);
    }
  };

  const updateNotificationTime = async (newTime: NotificationTime) => {
    try {
      setNotificationTime(newTime);
      const storedProfile = await AsyncStorage.getItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', theme, notifications: notificationsEnabled };
      const updatedProfile = { ...profile, notificationTime: newTime };
      await AsyncStorage.setItem('@profile', JSON.stringify(updatedProfile));
      // Remove the scheduling and alert from here; it will be handled in ProfileScreen.tsx
    } catch (error) {
      console.error('Error saving notification time:', error);
    }
  };

  const formatTime = ({ hour, minute }: NotificationTime) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        notificationsEnabled,
        setNotificationsEnabled: updateNotificationsEnabled,
        notificationTime,
        setNotificationTime: updateNotificationTime,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};