// app/(tabs)/profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Switch, Pressable, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { ThemeContext } from '../utils/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleDailyReminder } from '../utils/notificationUtils';
import { LinearGradient } from 'expo-linear-gradient';

// Debounce helper function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface ProfileData {
  name: string;
  bio: string;
}

export default function ProfileScreen() {
  const { theme, setTheme, notificationsEnabled, setNotificationsEnabled, notificationTime, setNotificationTime } = React.useContext(ThemeContext);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempNotificationTime, setTempNotificationTime] = useState(notificationTime);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@profile');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile({
            name: parsedProfile.name,
            bio: parsedProfile.bio,
          });
          setTempNotificationTime(parsedProfile.notificationTime || { hour: 20, minute: 0 });
        } else {
          const defaultProfile: ProfileData = {
            name: 'Guest',
            bio: 'Tell us about yourself!',
          };
          await AsyncStorage.setItem(
            '@profile',
            JSON.stringify({ ...defaultProfile, theme, notifications: notificationsEnabled, notificationTime })
          );
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (isFocused) loadProfile();
  }, [isFocused, theme, notificationsEnabled, notificationTime]);

  const formatTime = ({ hour, minute }: { hour: number; minute: number }) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(Platform.OS === 'ios'); // Keep picker open on iOS until dismissed
      if (selectedDate) {
        const hour = selectedDate.getHours();
        const minute = selectedDate.getMinutes();
        setTempNotificationTime({ hour, minute });
      }
    }
  };

  const onWebTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hour, minute] = event.target.value.split(':').map(Number);
    setTempNotificationTime({ hour, minute });
  };

  const saveProfile = useCallback(async () => {
    try {
      await setNotificationTime(tempNotificationTime);
      const updatedProfile = { ...profile, theme, notifications: notificationsEnabled, notificationTime: tempNotificationTime };
      await AsyncStorage.setItem('@profile', JSON.stringify(updatedProfile));

      if (notificationsEnabled) {
        await scheduleDailyReminder(tempNotificationTime);
        if (Platform.OS === 'web') {
          window.alert(`Success: Profile updated successfully! Daily reminders set for ${formatTime(tempNotificationTime)}.`);
        } else {
          Alert.alert('Success', `Profile updated successfully! Daily reminders set for ${formatTime(tempNotificationTime)}.`);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Success: Profile updated successfully!');
        } else {
          Alert.alert('Success', 'Profile updated successfully!');
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error in saveProfile:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to save profile. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    }
  }, [tempNotificationTime, profile, theme, notificationsEnabled, setNotificationTime, setIsEditing]);

  const debouncedSaveProfile = debounce(saveProfile, 1000);

  const currentTime = new Date();
  currentTime.setHours(tempNotificationTime.hour, tempNotificationTime.minute, 0);

  const handleSavePress = () => {
    debouncedSaveProfile();
  };

  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8']
    : ['#1a1d21', '#2f3439', '#3d4450'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            theme === 'light' ? styles.lightTheme : styles.darkTheme,
          ]}
        >
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle-outline" size={100} color={theme === 'light' ? '#FFC107' : '#FFD700'} />
            <Text style={[styles.profileName, theme === 'light' ? styles.lightText : styles.darkText]}>
              {profile.name}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>Name</Text>
              <TextInput
                style={[styles.input, theme === 'light' ? styles.lightInput : styles.darkInput]}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="Enter your name"
                placeholderTextColor={theme === 'light' ? '#999' : '#D3D3D3'}
              />

              <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput, theme === 'light' ? styles.lightInput : styles.darkInput]}
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme === 'light' ? '#999' : '#D3D3D3'}
                multiline
              />

              <View style={styles.switchContainer}>
                <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>
                  Theme: {theme}
                </Text>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                  thumbColor={theme === 'dark' ? '#FFD700' : '#f4f3f4'}
                  trackColor={{ false: '#767577', true: '#66BB6A' }}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>
                  Notifications
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => setNotificationsEnabled(value)}
                  thumbColor={notificationsEnabled ? '#FFC107' : '#f4f3f4'}
                  trackColor={{ false: '#767577', true: '#66BB6A' }}
                />
              </View>

              {notificationsEnabled && (
                <View style={styles.timePickerContainer}>
                  <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>
                    Daily Reminder Time
                  </Text>
                  <Pressable onPress={() => Platform.OS !== 'web' && setShowTimePicker(true)}>
                    {Platform.OS === 'web' ? (
                      <input
                        type="time"
                        value={`${tempNotificationTime.hour.toString().padStart(2, '0')}:${tempNotificationTime.minute.toString().padStart(2, '0')}`}
                        onChange={onWebTimeChange}
                        style={{
                          fontSize: 16,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: '#B0BEC5',
                          borderRadius: 8,
                          color: theme === 'light' ? '#000000' : '#ffffff',
                          backgroundColor: theme === 'light' ? '#ffffff' : '#33373d',
                          cursor: 'pointer',
                        }}
                      />
                    ) : (
                      <Text style={[styles.timeText, theme === 'light' ? styles.lightText : styles.darkText]}>
                        {formatTime(tempNotificationTime)}
                      </Text>
                    )}
                  </Pressable>
                  {Platform.OS !== 'web' && showTimePicker && (
                    <DateTimePicker
                      value={currentTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                      onChange={onTimeChange}
                      textColor={theme === 'light' ? '#000000' : '#ffffff'} // Ensure text is visible
                      style={Platform.OS === 'android' ? styles.androidPicker : undefined} // Custom style for Android
                      accentColor={theme === 'light' ? '#66BB6A' : '#FFD700'} // Highlight color for selection
                    />
                  )}
                </View>
              )}

              <View style={styles.buttonRow}>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSavePress}>
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.viewContainer}>
              <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>Bio</Text>
              <Text style={[styles.infoText, theme === 'light' ? styles.lightText : styles.darkText]}>
                {profile.bio || 'No bio yet.'}
              </Text>

              <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>Theme</Text>
              <Text style={[styles.infoText, theme === 'light' ? styles.lightText : styles.darkText]}>
                {theme}
              </Text>

              <Text style={[styles.label, theme === 'light' ? styles.lightText : styles.darkText]}>
                Notifications
              </Text>
              <Text style={[styles.infoText, theme === 'light' ? styles.lightText : styles.darkText]}>
                {notificationsEnabled ? `Enabled (at ${formatTime(notificationTime)})` : 'Disabled'}
              </Text>

              <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  lightTheme: {},
  darkTheme: {},
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
  viewContainer: {
    width: '100%',
  },
  editContainer: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  lightInput: {
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  darkInput: {
    backgroundColor: '#33373d',
    color: '#ffffff',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  timeText: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#66BB6A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#66BB6A',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  androidPicker: {
    backgroundColor: '#ffffff', // Ensure Android picker has a visible background in light mode
  },
});