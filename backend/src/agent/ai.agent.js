import { generateResponse } from "../ai/aiService.js";

export async function runAgent(message, env) {
    const response = await generateResponse(message, env.AI_API_KEY, env.MODEL_NAME);
    return response;
}