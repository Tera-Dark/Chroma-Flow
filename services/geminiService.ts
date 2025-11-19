import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedPaletteResponse } from "../types";

// Check for API Key immediately. In a real app, we might handle this more gracefully in the UI.
const API_KEY = process.env.API_KEY;

export const generatePaletteFromPrompt = async (prompt: string): Promise<GeneratedPaletteResponse | null> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    throw new Error("Gemini API Key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a creative and harmonious color palette based on this description: "${prompt}". 
      Provide exactly 5 colors. Ensure the hex codes are valid. 
      Return the result as a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            palette_name: { type: Type.STRING, description: "A creative name for this palette" },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING, description: "The 6-character hex code, e.g. #FF5733" },
                  name: { type: Type.STRING, description: "A creative name for the color" },
                  description: { type: Type.STRING, description: "Why this color fits the theme" }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedPaletteResponse;
    }
    return null;

  } catch (error) {
    console.error("Error generating palette with Gemini:", error);
    throw error;
  }
};