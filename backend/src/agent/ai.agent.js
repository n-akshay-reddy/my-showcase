import { generateResponse } from "../ai/aiService.js";
import { buildSystemPrompt } from "../ai/prompts/systemPrompt.js";
import { describeToolsForPrompt } from "./tools/index.js";
import { parseDecision, validateDecision } from "./decisionSchema.js";
import profile from "../data/profile/index";

export async function runAgent(message, env) {
    const rawResponse = await generateResponse({
        prompt: message,
        systemInstruction: buildSystemPrompt(describeToolsForPrompt(), profile),
        apiKey: env.AI_API_KEY,
        modelName: env.MODEL_NAME,
    });

    const parsedDecision = parseDecision(rawResponse);

    if (!parsedDecision) {
        throw new Error("AI returned an invalid decision format.");
    }

    const result = validateDecision(parsedDecision);

    if (!result.valid) {
        console.error("Invalid AI decision:", result.errors);
        throw new Error("AI returned an invalid decision.");
    }

    return result.decision;
}