import { GoogleGenAI } from "@google/genai";

export async function generateResponse({ prompt, systemInstruction, apiKey, modelName }) {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json"
        }
    });

    return response.text;
}