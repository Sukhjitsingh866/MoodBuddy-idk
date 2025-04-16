// app/(auth)/Login.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const stored = await AsyncStorage.getItem("users");
      let users = stored ? JSON.parse(stored) : [];

      if (isSignup) {
        if (users.find((u) => u.username === username)) {
          setError("Username already exists");
          return;
        }
        users.push({ username, password });
        await AsyncStorage.setItem("users", JSON.stringify(users));
        await AsyncStorage.setItem("currentUser", username);
        console.log("Redirecting to home page");
        router.replace("/");
      } else {
        const user = users.find((u) => u.username === username && u.password === password);
        if (user) {
          await AsyncStorage.setItem("currentUser", username);
          console.log("Redirecting to home page");
          router.replace("/");
        } else {
          setError("Invalid username or password");
        }
      }
    } catch (e) {
      setError("Error accessing storage");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoodBuddy {isSignup ? "Sign Up" : "Login"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignup ? "Sign Up" : "Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setError(""); }}>
        <Text style={styles.toggleText}>
          {isSignup ? "Already have an account? Login" : "Need an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: 300,
    padding: 10,
    borderWidth: 1,
    borderColor: "white",
    color: "white",
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 4,
    borderColor: "#ffd33d",
    borderRadius: 18,
    width: 150,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  toggleText: {
    color: "#ffd33d",
    textDecorationLine: "underline",
  },
});