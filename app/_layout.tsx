import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    //changes the color of the status bar on phone
  <>
    <StatusBar style="light"/>

    <Stack>
      <Stack.Screen 
      name = "(tabs)" 
      options={{
          headerShown: false
        }}
        />
      <Stack.Screen 
      name = "+not-found" 
      options={{
        headerShown: false
        }}/>
        
    </Stack>
  </>
 
  );
}
