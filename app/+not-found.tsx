import { View, StyleSheet } from "react-native";
import { Link,Stack } from "expo-router"

export default function NotFoundScreen() {
  return (
    <>
    <Stack.Screen options = {{title: "Oops! Not Found"}}/>
    <View style = {styles.container}>
      <Link href={"/"} style = {styles.button}>
        Go back to Home Screen
      </Link>
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "black"
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "black"
  }
})