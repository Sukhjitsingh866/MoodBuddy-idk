import axios from "axios";
import dataset from "../../assets/rule_based_data.json" // Import the dataset

// Load dataset into rule-based responses
const ruleBasedResponses = {};
dataset.forEach((conversation) => {
  const userMessage = conversation[0].user.toLowerCase().trim();
  const systemResponse = conversation[1].system;
  ruleBasedResponses[userMessage] = systemResponse;
});

// Add additional rule-based responses
ruleBasedResponses["hello"] = "Hi! How are you feeling today?";
ruleBasedResponses["i am sad"] = "I'm sorry to hear that. Do you want to talk about it?";
ruleBasedResponses["yes"] = "I'm here for you. Can you tell me more?";
ruleBasedResponses["no"] = "That's okay. Remember, you're not alone.";
ruleBasedResponses["help"] = "If you need urgent help, please reach out to a professional or call a helpline.";

// Crisis keywords for escalation
const crisisKeywords = ["suicide", "self-harm", "end my life", "can't go on"];

export const detectCrisis = (message) => {
  return crisisKeywords.some((word) => message.toLowerCase().includes(word));
};

// Function to get chatbot response
export const getResponse = async (message) => {
  const normalizedMessage = message.toLowerCase().trim();

  // Crisis detection
  if (detectCrisis(normalizedMessage)) {
    return {
      type: "crisis",
      response:
        "I'm really sorry you're feeling this way. Please reach out to a professional or call a helpline immediately."
    };
  }

  // Rule-based response
  if (ruleBasedResponses[normalizedMessage]) {
    return { type: "rule", response: ruleBasedResponses[normalizedMessage] };
  }

  // AI fallback
  return { type: "ai", response: await aiFallback(message) };
};

// AI fallback function (ChatGPT API)
const aiFallback = async (message) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // or 'gpt-4'
        messages: [
          {
            role: "system",
            content: "You are a mental health support chatbot. Provide empathetic and helpful responses."
          },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}` // Secure API key handling
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Fallback Error:", error);
    return "Sorry, I couldn't process that. Can you try rephrasing?";
  }
};