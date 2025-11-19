// config/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get text-only model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
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
      maxOutputTokens: 2048,
    },
  });
};

// Test connection
export const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("✓ Gemini AI connected successfully");
    return true;
  } catch (error) {
    console.error("✗ Gemini AI connection failed:", error.message);
    return false;
  }
};

// Test connection on import
testGeminiConnection();
