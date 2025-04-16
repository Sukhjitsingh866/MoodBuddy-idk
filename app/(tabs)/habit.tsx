// app/(tabs)/habit.tsx
import { View, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import HabitBuilder from "../components/HabitBuilder";
import { ThemeContext } from '../utils/ThemeContext';
import { themes } from '../utils/theme';

export default function Habit() {
  const { theme } = useContext(ThemeContext);

  // Define gradient colors for light and dark themes
  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8'] // Light theme gradient
    : ['#1a1d21', '#2f3439', '#3d4450']; // Dark theme gradient (existing colors)

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <HabitBuilder label="Add a habit" theme={theme} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});