import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button } from "react-native";
import RNFS from 'react-native-fs';
import Badge from '../components/Badge';
import badgesData from '../../assets/badges.json';

export default function Achievements() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Load badges data from the JSON file
    setBadges(badgesData.badges);
  }, []);



  return (
    <View style={styles.container}>
      <Text style={styles.text}>Achievements Screen</Text>
      {badges.map((badge, index) => (
        <Badge
          key={index}
          title={badge.title}
          description={badge.description}
          completed={badge.completed}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e"
  },
  text: {
    color: "white",
    marginBottom: 20,
  },
});