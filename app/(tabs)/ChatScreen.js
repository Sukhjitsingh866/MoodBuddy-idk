// app/(tabs)/ChatScreen.tsx
import React, { useState, useEffect } from "react";
import { Alert, StyleSheet } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { getResponse, detectCrisis } from "./chatbot";
import { ThemeContext } from '../utils/ThemeContext';
import { themes } from '../utils/theme';

const ChatBots = () => {
  const { theme } = React.useContext(ThemeContext);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello! I'm your mental health assistant. How can I support you today?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Chatbot",
        },
      },
    ]);
  }, []);

  const onSend = async (newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0].text;
    // Pass the entire messages array (excluding the newest user message) as history
    const history = messages;
    const botResponse = await getResponse(userMessage, history);

    // Show an alert if a crisis message is detected
    if (detectCrisis(userMessage)) {
      Alert.alert(
        "Crisis Detected",
        "I'm really sorry you're feeling this way. Please reach out to a professional or call a helpline immediately.",
        [{ text: "OK", style: "cancel" }]
      );
    }

    // Handle off-topic response
    if (botResponse.type === "off-topic") {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            _id: Math.random().toString(),
            text: botResponse.response,
            createdAt: new Date(),
            user: { _id: 2, name: "Chatbot" },
          },
        ])
      );
    } else {
      // Continue chatbot response in chat for other types (rule, ai, crisis)
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            _id: Math.random().toString(),
            text: botResponse.response,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: botResponse.type === "crisis" ? "Crisis Support" : "Chatbot",
            },
          },
        ])
      );
    }
  };

  // Define gradient colors for light and dark themes
  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8'] // Light theme gradient
    : ['#1a1d21', '#2f3439', '#3d4450']; // Dark theme gradient

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: 1 }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: theme === 'light' ? '#007AFF' : '#1E90FF' }, // User messages: Blue, slightly lighter in dark mode
              left: { backgroundColor: theme === 'light' ? '#E5E5EA' : '#33373d' }, // Bot messages: Light gray in light mode, darker in dark mode
            }}
            textStyle={{
              right: { color: '#ffffff' }, // User message text: Always white for contrast
              left: { color: themes[theme].text }, // Bot message text: Black in light mode, white in dark mode
            }}
            timeTextStyle={{
              right: { color: '#ffffff' }, // User message time: White
              left: { color: theme === 'light' ? '#666666' : '#D3D3D3' }, // Bot message time: Gray shades for contrast
            }}
          />
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
});

export default ChatBots;