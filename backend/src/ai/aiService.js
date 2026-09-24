import { GoogleGenAI } from "@google/genai";

export async function generateResponse(prompt, apiKey, modelName) {

    const ai = new GoogleGenAI({apiKey});
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
    });

    return response.text;
}