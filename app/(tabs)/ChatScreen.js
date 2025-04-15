import React, { useState, useEffect } from "react";
import { Alert, StyleSheet } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { getResponse, detectCrisis } from "./chatbot";

const ChatBots = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello! I'm your mental health assistant. How can I support you today?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Chatbot"
        }
      }
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
            user: { _id: 2, name: "Chatbot" }
          }
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
              name: botResponse.type === "crisis" ? "Crisis Support" : "Chatbot"
            }
          }
        ])
      );
    }
  };

  return (
    <GiftedChat 
      listViewProps={{ style: { backgroundColor: '#25292e' } }}
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{ _id: 1 }}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            right: { backgroundColor: "#007AFF" },
            left: { backgroundColor: "#E5E5EA" }
          }}
        />
      )}
    />
  );
};

export default ChatBots;