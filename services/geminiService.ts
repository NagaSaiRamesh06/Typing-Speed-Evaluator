import { GoogleGenAI } from "@google/genai";
import { GEMINI_PROMPT } from "../constants";

// Ideally, this should be proxied through a backend to hide the key, 
// but for this client-side demo we access it directly if available.
const API_KEY = process.env.API_KEY || '';

export const generateTypingText = async (): Promise<string> => {
  if (!API_KEY) {
    console.warn("No Gemini API Key found. Using fallback text.");
    return Promise.reject("No API Key");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: GEMINI_PROMPT,
    });
    
    return response.text || "Failed to generate text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};