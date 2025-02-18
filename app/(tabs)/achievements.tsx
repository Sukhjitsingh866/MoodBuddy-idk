import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import Badge from '../components/Badge';
import RankBadge from '../components/RankBadge.tsx'; // Import the new RankBadge component
import badgesData from '../../assets/badges.json';


export default function Achievements() {
  const [badges, setBadges] = useState([]);
  const [habitStreak, setHabitStreak] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);


  useEffect(() => {
    // Load badges and streak data from the JSON file
    setBadges(badgesData.badges);
    setHabitStreak(badgesData.streaks.habit);
    setJournalStreak(badgesData.streaks.journal);
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Achievements Screen</Text>


      {/* Ranked Badges Side by Side */}
      <View style={styles.rankBadgesRow}>
        <RankBadge
          title={`Habit Streak`}
          description={`${habitStreak} days`}
          streak={habitStreak}
        />
        <RankBadge
          title={`Journal Streak`}
          description={`${journalStreak} days`}
          streak={journalStreak}
        />
      </View>


      {/* List of Achievements */}
      {badges.map((badge, index) => (
        <Badge
          key={index}
          title={badge.title}
          description={badge.description}
          completed={badge.completed}
        />
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
    paddingVertical: 20,
  },
  text: {
    color: 'white',
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
