// components/RankBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { themes } from '../utils/theme';

interface RankBadgeProps {
  title: string;
  description: string;
  streak: number;
  theme: 'light' | 'dark';
}

const RankBadge: React.FC<RankBadgeProps> = ({ title, description, streak, theme }) => {
  // Function to determine the badge color based on streak level
  const getBadgeColor = () => {
    if (streak >= 30) return '#a089cc'; // Platinum (purple)
    if (streak >= 20) return '#FFD700'; // Gold (yellow)
    if (streak >= 10) return '#C0C0C0'; // Silver
    if (streak >= 5) return '#ad612a'; // Stone
    return '#ad2a35'; // Default
  };

  const badgeColor = getBadgeColor();

  return (
    <View style={[styles.rankBadgeContainer, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)', borderColor: badgeColor }]}>
      <SimpleLineIcons
        name="badge"
        size={24}
        color={badgeColor}
        style={styles.icon}
      />
      <Text style={[styles.rankBadgeTitle, { color: badgeColor }]}>
        {title}
      </Text>
      <Text style={[styles.rankBadgeDescription, { color: themes[theme].text }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rankBadgeContainer: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    borderWidth: 2,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  rankBadgeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  rankBadgeDescription: {
    textAlign: 'center',
  },
  icon: {
    marginBottom: 5,
  },
});

export default RankBadge;