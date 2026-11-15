import { generateResponse } from "../../ai/aiService.js";
import { buildComposePrompt } from "../../ai/prompts/composePrompt.js";
import { parseDecision } from "../decisionSchema.js";

export async function composeAgent(message, env) {
    const rawResponse = await generateResponse({
        prompt: message,
        systemInstruction: buildComposePrompt(),
        apiKey: env.AI_API_KEY,
        modelName: env.MODEL_NAME,
    });

    const mail = parseDecision(rawResponse);

    if (!mail || typeof mail.subject !== "string" || typeof mail.body !== "string") {
        throw new Error("AI returned an invalid mail format.");
    }

    return { subject: mail.subject.trim(), body: mail.body.trim() };
}