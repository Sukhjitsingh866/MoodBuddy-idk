// app/utils/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDailyReminder, clearNotificationRescheduling } from './notificationUtils';
import { Alert, Platform } from 'react-native';

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

// AsyncStorage wrapper with localStorage fallback for web
const safeGetItem = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error in safeGetItem (ThemeContext):', error);
    if (Platform.OS === 'web') {
      console.log('Falling back to localStorage for getItem');
      return localStorage.getItem(key);
    }
    throw error;
  }
};

const safeSetItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error in safeSetItem (ThemeContext):', error);
    if (Platform.OS === 'web') {
      console.log('Falling back to localStorage for setItem');
      localStorage.setItem(key, value);
    } else {
      throw error;
    }
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationTime, setNotificationTimeState] = useState<NotificationTime>({ hour: 20, minute: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('Loading profile in ThemeContext');
        const storedProfile = await safeGetItem('@profile');
        console.log('Stored profile in ThemeContext:', storedProfile);
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setTheme(profile.theme || 'dark');
          setNotificationsEnabled(profile.notifications ?? true);
          setNotificationTimeState(profile.notificationTime || { hour: 20, minute: 0 });
        }
      } catch (error) {
        console.error('Error loading profile in ThemeContext:', error);
      }
    };
    loadProfile();
  }, []);

  const updateTheme = async (newTheme: Theme) => {
    try {
      console.log('Updating theme:', newTheme);
      setTheme(newTheme);
      const storedProfile = await safeGetItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', notifications: notificationsEnabled, notificationTime };
      const updatedProfile = { ...profile, theme: newTheme };
      await safeSetItem('@profile', JSON.stringify(updatedProfile));
      console.log('Theme updated and saved');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateNotificationsEnabled = async (enabled: boolean) => {
    try {
      console.log('Updating notifications enabled:', enabled);
      setNotificationsEnabled(enabled);
      const storedProfile = await safeGetItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', theme, notificationTime };
      const updatedProfile = { ...profile, notifications: enabled };
      await safeSetItem('@profile', JSON.stringify(updatedProfile));
      console.log('Notifications enabled updated and saved');

      if (enabled) {
        await scheduleDailyReminder(notificationTime);
        if (Platform.OS === 'web') {
          window.alert(`Notifications Enabled: You will receive daily reminders at ${formatTime(notificationTime)}.`);
        } else {
          Alert.alert('Notifications Enabled', `You will receive daily reminders at ${formatTime(notificationTime)}.`);
        }
      } else {
        await clearNotificationRescheduling();
        if (Platform.OS === 'web') {
          window.alert('Notifications Disabled: All scheduled reminders have been canceled.');
        } else {
          Alert.alert('Notifications Disabled', 'All scheduled reminders have been canceled.');
        }
      }
    } catch (error) {
      console.error('Error updating notifications setting:', error);
    }
  };

  const updateNotificationTime = async (newTime: NotificationTime) => {
    try {
      console.log('Updating notification time:', newTime);
      setNotificationTimeState(newTime);
      const storedProfile = await safeGetItem('@profile');
      const profile = storedProfile
        ? JSON.parse(storedProfile)
        : { name: 'Guest', bio: '', theme, notifications: notificationsEnabled };
      const updatedProfile = { ...profile, notificationTime: newTime };
      await safeSetItem('@profile', JSON.stringify(updatedProfile));
      console.log('Notification time updated and saved');
    } catch (error) {
      console.error('Error saving notification time:', error);
      throw error; // Re-throw to be caught in saveProfile
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