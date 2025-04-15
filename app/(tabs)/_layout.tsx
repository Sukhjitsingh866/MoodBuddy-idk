// app/(tabs)/layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Plus from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect } from 'react';
import { ThemeContext, ThemeProvider } from '../utils/ThemeContext';
import { themes } from '../utils/theme';
import { setupNotifications, setupNotificationListener, scheduleDailyReminder, setupNotificationRescheduling } from '../utils/notificationUtils';
import { useNavigation } from 'expo-router';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

function TabsLayoutInner() {
  const { theme, notificationsEnabled, notificationTime } = React.useContext(ThemeContext);
  const navigation = useNavigation();

  useEffect(() => {
    // Clear all scheduled notifications at app start to prevent leftovers (native only)
    if (Platform.OS !== 'web') {
      Notifications.cancelAllScheduledNotificationsAsync().then(() => {
        console.log('Manually cleared all scheduled notifications at app start (native)');
      });
    } else {
      console.log('Skipping notification clearing on web (not supported)');
    }

    console.log('useEffect in TabsLayoutInner running');
    console.log('Notifications enabled:', notificationsEnabled);
    console.log('Notification time:', notificationTime);

    setupNotifications().then(result => {
      if (!result) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notification permissions in your device settings to receive reminders. If the issue persists, consider logging in to Expo to enable full notification support.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (notificationsEnabled) {
        console.log('App start: Scheduling initial notification with time:', notificationTime);
        scheduleDailyReminder(notificationTime).then(() => {
          console.log('Setting up rescheduling listener after initial scheduling');
          setupNotificationRescheduling();
        });
      } else {
        console.log('Notifications are disabled, skipping initial scheduling');
      }
    }).catch(error => {
      console.error('Error setting up notifications:', error);
      Alert.alert(
        'Notification Setup Error',
        'Failed to set up notifications. Consider logging in to Expo to enable full notification support.',
        [{ text: 'OK' }]
      );
    });

    const cleanupListener = setupNotificationListener(navigation);

    return () => {
      console.log('Cleaning up listeners in TabsLayoutInner');
      cleanupListener();
    };
  }, []); // Run only once on mount

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: themes[theme].background,
        },
        headerShadowVisible: false,
        headerTintColor: themes[theme].text,
        tabBarStyle: {
          backgroundColor: themes[theme].background,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          headerTitle: "MoodBuddy",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons 
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen 
        name="ChatScreen" 
        options={{
          headerTitle: "Chatbot",
          tabBarLabel: "Chatbot",
          tabBarIcon: ({ focused, size, color }) => (
            <MaterialCommunityIcons 
              name={focused ? "robot-excited" : "robot-excited-outline"} 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="journal" 
        options={{
          headerTitle: "Journal",
          tabBarLabel: "Journal",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={size} 
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen 
        name="habit" 
        options={{
          headerTitle: "Habit",
          tabBarLabel: "Habit",
          tabBarIcon: ({ focused, size, color }) => (
            <Plus 
              name={focused ? "plus-minus" : "plus-minus-variant"} 
              size={size} 
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen 
        name="achievements" 
        options={{
          headerTitle: "Awards",
          tabBarLabel: "Awards",
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons 
              name={focused ? "trophy" : "trophy-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel="Profile tab"
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <ThemeProvider>
      <TabsLayoutInner />
    </ThemeProvider>
  );
}