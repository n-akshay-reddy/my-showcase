import { generateResponse } from "../../ai/aiService.js";
import { buildComposePrompt } from "../../ai/prompts/composePrompt.js";
import { parseDecision } from "../decisionSchema.js";

export async function composeAgent(input, env, signal) {
    const rawResponse = await generateResponse({
        // the compose prompt describes the input as ONE JSON object, so send it as JSON text
        prompt: JSON.stringify(input),
        systemInstruction: buildComposePrompt(),
        apiKey: env.AI_API_KEY,
        modelName: env.MODEL_NAME,
        signal,
    });

    const mail = parseDecision(rawResponse);
    const body = typeof mail?.body === "string" ? mail.body.trim() : "";
    const subject = typeof mail?.subject === "string" ? mail.subject.trim() : "";

    // The controller turns null into a clear 502 for the visitor
    if (!body || (input.channel === "gmail" && !subject)) {
        console.error("Compose: unusable AI response:", rawResponse);
        return null;
    }

    return { subject: input.channel === "gmail" ? subject : null, body };
}