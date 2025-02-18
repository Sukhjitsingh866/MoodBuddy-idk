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

  // AI fallback (Now using Google Gemini)
  return { type: "ai", response: await aiGoogleGemini(message) };
};
// AI fallback function using Google Gemini API
const aiGoogleGemini = async (message) => {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCbl2IXoemANZJwMgpobo18EsvXICALF6U", // Google Gemini API endpoint
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    // Extracting the response text
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Return the response or a fallback message if not found
    return aiResponse || "Sorry, I couldn't process that. Can you try rephrasing?";
  } catch (error) {
    console.error("Google Gemini Error:", error);
    return "Sorry, something went wrong. Please try again later.";
  }
};
