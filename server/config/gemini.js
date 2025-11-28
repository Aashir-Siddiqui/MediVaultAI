import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get text-only model - FIXED with higher token limits
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4, // Lower for more consistent JSON
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192, // INCREASED from 2048
      responseMimeType: "application/json", // Force JSON response
    },
  });
};

// Get vision model for image analysis
export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 32,
      maxOutputTokens: 8192, // INCREASED from 2048
      responseMimeType: "application/json", // Force JSON response
    },
  });
};

// Test connection
export const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("✅ Gemini AI connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Gemini AI connection failed:", error.message);
    return false;
  }
};

// Test connection on import
testGeminiConnection();
