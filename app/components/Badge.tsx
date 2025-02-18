import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';


interface BadgeProps {
  title: string;
  description: string;
  completed: boolean;
}


const Badge: React.FC<BadgeProps> = ({ title, description, completed }) => {
  return (
    <View
      style={[
        styles.badgeContainer,
        completed ? styles.completedBadge : styles.inactiveBadge,
      ]}
    >
      <SimpleLineIcons
        name="badge"
        size={24}
        color={completed ? '#FFD700' : '#888'}
        style={styles.icon}
      />
      <Text style={[styles.badgeTitle, !completed && styles.inactiveText]}>
        {title}
      </Text>
      <Text style={[styles.badgeDescription, !completed && styles.inactiveText]}>
        {description}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  badgeContainer: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#444',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5, // For Android
  },
  inactiveBadge: {
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2, // For Android
  },
  icon: {
    marginBottom: 5,
  },
  badgeTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  badgeDescription: {
    color: 'white',
  },
  inactiveText: {
    color: '#888',
  },
});


export default Badge;
