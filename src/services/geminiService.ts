import { GoogleGenAI, Type } from "@google/genai";
import { MaterialItem } from '../types';

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

export const parseMaterialRequest = async (text: string): Promise<MaterialItem[]> => {
  if (!ai) {
    throw new Error("Gemini API is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract a list of construction materials from this text: "${text}". 
      Return a JSON array where each object has 'name' (string), 'quantity' (number), and 'unit' (string). 
      Infer standard units if missing. If the quantity is not specified, assume 1.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
            },
            required: ["name", "quantity", "unit"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    
    // Add IDs to the items
    return parsed.map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    }));

  } catch (error) {
    console.error("Gemini parsing error:", error);
    return [];
  }
};

export const analyzeRequestRisk = async (requestSummary: string): Promise<string> => {
    if (!ai) return "AI Analysis Unavailable";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this construction material request for potential issues (e.g., unusual quantities, expensive items, vague descriptions). 
            Request: ${requestSummary}. 
            Keep it very brief (max 1 sentence). Start with "Risk: Low" or "Risk: Medium" or "Risk: High".`
        });
        return response.text || "No analysis available.";
    } catch (error) {
        return "Analysis failed.";
    }
}