import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Plus from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabsLayout() {
  return (
    /*Header and Bottom Tabs Style*/
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: "#ffd33d",
      headerStyle: {
        backgroundColor: "#25292e",
      },
      headerShadowVisible: false,
      headerTintColor: "#fff",
      tabBarStyle: {
        backgroundColor: "#25292e"
      }
    }}
    >
      
    <Tabs.Screen 
    name = "index" 
    options={{
      headerTitle: "MoodBuddy",
      tabBarLabel: "Home",
      tabBarIcon: ({focused, size, color}) => 
      <Ionicons 
      name={focused ? "home-sharp" : "home-outline"}
      color={color}
      size={size}/>,
      }}
      />

    <Tabs.Screen 
    name = "ChatScreen" 
    options={{
      headerTitle: "Chatbot",
      tabBarLabel: "Chatbot",
      tabBarIcon: ({focused,size, color}) => 
      <MaterialCommunityIcons 
      name={focused ? "robot-excited" : "robot-excited-outline"} 
      size={size} 
      color={color}/>
      }}
      />
      
    <Tabs.Screen
    name = "journal" 
    options={{
      headerTitle: "Journal",
      tabBarLabel: "Journal",
      tabBarIcon: ({focused,size, color}) => 
      <Ionicons 
      name={focused ? "book" : "book-outline"} 
      size={size} 
      color={color}/>
      }}
      />

    <Tabs.Screen 
    name = "habit" 
    options={{
      headerTitle: "Habit",
      tabBarLabel: "Habit",
      tabBarIcon: ({ focused, size, color }) => 
      <Plus 
      name={focused ? "plus-minus" : "plus-minus-variant"} 
      size={size} 
      color={color}/>
      }}
      />

    <Tabs.Screen 
    name = "achievements" 
    options={{
      headerTitle: "Awards",
      tabBarLabel: "Awards",
      tabBarIcon: ({ focused, size, color }) =>
        <Ionicons 
          name={focused ? "trophy" : "trophy-outline"} 
          size={size} 
          color={color} 
        />
      }}/>

  </Tabs>
  );
}
