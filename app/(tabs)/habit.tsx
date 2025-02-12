import { View, StyleSheet } from "react-native";
import React from "react";
import HabitBuilder from "@/components/HabitBuilder";



export default function Habit() {

  return (
    <View style = {styles.container}>
      
      <HabitBuilder label="Add a habit" />
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
    color: "white"
  },
})