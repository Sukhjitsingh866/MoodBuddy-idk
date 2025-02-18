import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';


interface RankBadgeProps {
  title: string;
  description: string;
  streak: number;
}


const RankBadge: React.FC<RankBadgeProps> = ({ title, description, streak }) => {
  // Function to determine the badge color based on streak level
  const getBadgeColor = () => {
    if (streak >= 30) return '#a089cc'; // Platinum
    if (streak >= 20) return '#FFD700'; // Gold
    if (streak >= 10) return '#C0C0C0'; // Silver
    if (streak >= 5) return '#ad612a'; // Stone
    return '#ad2a35'; // Default
  };


  const badgeColor = getBadgeColor();


  return (
    <View style={[styles.rankBadgeContainer, { borderColor: badgeColor }]}>
      <SimpleLineIcons
        name="badge"
        size={24}
        color={badgeColor}
        style={styles.icon}
      />
      <Text style={[styles.rankBadgeTitle, { color: badgeColor }]}>
        {title}
      </Text>
      <Text style={styles.rankBadgeDescription}>{description}</Text>
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
  },
  rankBadgeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  rankBadgeDescription: {
    color: 'white',
    textAlign: 'center',
  },
  icon: {
    marginBottom: 5,
  },
});


export default RankBadge;
