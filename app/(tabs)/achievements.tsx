// app/(tabs)/achievements.tsx
import React, { useEffect, useState, useContext } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import Badge from '../components/Badge';
import RankBadge from '../components/RankBadge';
import badgesData from '../../assets/badges.json';
import { ThemeContext } from '../utils/ThemeContext';
import { themes } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

export default function Achievements() {
  const { theme } = useContext(ThemeContext);
  const [badges, setBadges] = useState([]);
  const [habitStreak, setHabitStreak] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);

  useEffect(() => {
    // Load badges and streak data from the JSON file
    setBadges(badgesData.badges);
    setHabitStreak(badgesData.streaks.habit);
    setJournalStreak(badgesData.streaks.journal);
  }, []);

  // Define gradient colors for light and dark themes
  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8'] // Light theme gradient
    : ['#1a1d21', '#2f3439', '#3d4450']; // Dark theme gradient

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.text, { color: themes[theme].text }]}>Achievements Screen</Text>

        {/* Ranked Badges Side by Side */}
        <View style={styles.rankBadgesRow}>
          <RankBadge
            title={`Habit Streak`}
            description={`${habitStreak} days`}
            streak={habitStreak}
            theme={theme}
          />
          <RankBadge
            title={`Journal Streak`}
            description={`${journalStreak} days`}
            streak={journalStreak}
            theme={theme}
          />
        </View>

        {/* List of Achievements */}
        {badges.map((badge, index) => (
          <Badge
            key={index}
            title={badge.title}
            description={badge.description}
            completed={badge.completed}
            theme={theme}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  text: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankBadgesRow: {
    flexDirection: 'row', // Align badges side by side
    justifyContent: 'space-between', // Add space between badges
    width: '90%', // Adjust width as needed
    marginBottom: 20, // Add margin below the row
  },
});