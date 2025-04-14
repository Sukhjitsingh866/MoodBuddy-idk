import axios from "axios";
import dataset from "../../assets/rule_based_data.json"; // Import the dataset

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

// Function to check if message is mental health-related using DeepSeek
const isMentalHealthRelated = async (message) => {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a classifier. Determine if the following message is related to mental health (emotions, stress, support, etc.) or not. Respond with 'yes' or 'no' only."
          },
          { role: "user", content: message }
        ],
        max_tokens: 10, // Tiny response, just 'yes' or 'no'
        temperature: 0.3, // Very focused output
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-d70bef3ddcde4229a0d97cadf3b2ebee",
        },
      }
    );

    const result = response.data?.choices?.[0]?.message?.content.trim().toLowerCase();
    return result === "yes";
  } catch (error) {
    console.error("Intent Check Error:", error);
    return false; // Default to "no" if API fails, to avoid unnecessary costs
  }
};

// Function to get chatbot response
export const getResponse = async (message) => {
  const normalizedMessage = message.toLowerCase().trim();

  // Crisis detection
  if (detectCrisis(normalizedMessage)) {
    return {
      type: "crisis",
      response:
        "I'm really sorry you're feeling this way. Please reach out to a professional or call a helpline immediately.",
    };
  }

  // Rule-based response
  if (ruleBasedResponses[normalizedMessage]) {
    return { type: "rule", response: ruleBasedResponses[normalizedMessage] };
  }

  // Check intent with AI
  const isRelevant = await isMentalHealthRelated(normalizedMessage);
  if (!isRelevant) {
    return {
      type: "off-topic",
      response: "I’m here to help with mental health concerns like feeling sad, stressed, or anxious. How can I assist you with that?"
    };
  }

  // AI fallback (DeepSeek) for mental health topics only
  return { type: "ai", response: await aiDeepSeek(message) };
};

// AI fallback function using DeepSeek API
const aiDeepSeek = async (message) => {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "user", content: message }
        ],
        max_tokens: 100,
        temperature: 0.6,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-d70bef3ddcde4229a0d97cadf3b2ebee",
        },
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content;
    return aiResponse || "Sorry, I couldn't process that. Can you try rephrasing?";
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return "Sorry, something went wrong. Please try again later.";
  }
};