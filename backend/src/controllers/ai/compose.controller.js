import { composeAgent } from "../../agent/messageComposer/compose.agent.js";

const CHANNELS = ["gmail", "message"];
const TOPICS = ["job", "project", "collaboration", "hi", "general"];

const LIMITS = { name: 100, email: 254, prompt: 500, subject: 200, body: 2000 };

const json = (status, statusText, payload) =>
    new Response(JSON.stringify(payload), {
        status,
        statusText,
        headers: { "Content-Type": "application/json" },
    });

const badRequest = (error, message) =>
    json(400, "Bad Request", { success: false, error, message });

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);


function parseComposeInput(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { response: badRequest("InvalidPayload", "The request body must be a JSON object.") };
    }

    const { channel } = raw;
    if (!CHANNELS.includes(channel)) {
        return { response: badRequest("InvalidChannel", `channel must be one of: ${CHANNELS.join(", ")}.`) };
    }

    const topic = TOPICS.includes(raw.topic) ? raw.topic : "general";

    const name = str(raw.sender?.name);
    const email = str(raw.sender?.email);
    if (name && name.length > LIMITS.name) {
        return { response: badRequest("NameTooLong", `The name must not exceed ${LIMITS.name} characters.`) };
    }
    if (email && email.length > LIMITS.email) {
        return { response: badRequest("EmailTooLong", `The email must not exceed ${LIMITS.email} characters.`) };
    }

    if (raw.prompt != null && typeof raw.prompt !== "string") {
        return { response: badRequest("InvalidPrompt", "prompt must be a string.") };
    }
    const prompt = (raw.prompt ?? "").trim();
    if (prompt.length > LIMITS.prompt) {
        return { response: badRequest("PromptTooLong", `The prompt must not exceed ${LIMITS.prompt} characters.`) };
    }

    let current = null;
    if (raw.current != null) {
        if (typeof raw.current !== "object" || Array.isArray(raw.current)) {
            return { response: badRequest("InvalidCurrent", "current must be an object or null.") };
        }
        const body = str(raw.current.body);
        const subject = str(raw.current.subject);
        if (body && body.length > LIMITS.body) {
            return { response: badRequest("DraftTooLong", `The current draft must not exceed ${LIMITS.body} characters.`) };
        }
        if (subject && subject.length > LIMITS.subject) {
            return { response: badRequest("SubjectTooLong", `The subject must not exceed ${LIMITS.subject} characters.`) };
        }
        if (body) current = { subject: channel === "gmail" ? subject : null, body };
    }

    return { input: { channel, topic, sender: { name, email }, prompt, current } };
}

const AI_ERRORS = {
    400: ["InvalidAIRequest", "Sreevi couldn't process that request. Please try rephrasing it."],
    401: ["AIAuthenticationError", "Sreevi is temporarily unable to access its AI service."],
    403: ["AIAuthenticationError", "Sreevi is temporarily unable to access its AI service."],
    404: ["AIModelUnavailable", "Sreevi's AI model is unavailable. Please try again later."],
    429: ["AIRateLimitExceeded", "Sreevi is receiving too many requests right now. Please wait a moment and try again."],
};

export async function handleComposeRequest(request, env, ctx) {
    try {
        let raw;
        try {
            raw = await request.json();
        } catch {
            return badRequest("InvalidJSON", "The request body must be valid JSON.");
        }

        const { input, response } = parseComposeInput(raw);
        if (response) return response;

        // request.signal fires when the visitor presses Stop.
        const result = await composeAgent(input, env, request.signal);

        if (!result) {
            console.error("Sreevi compose returned an unusable response.");
            return json(502, "Bad Gateway", {
                success: false,
                error: "InvalidAIResponse",
                message: "Sreevi didn't return a usable message. Please try again.",
            });
        }

        return json(200, "OK", { success: true, data: result });
    } catch (error) {
        if (request.signal?.aborted || error?.name === "AbortError") {
            return new Response(null, { status: 499 });
        }

        const status = Number(error?.status ?? error?.statusCode);

        console.error("Sreevi compose request failed:", {
            name: error?.name,
            status,
            message: error?.message,
        });

        const [errorCode, message] =
            AI_ERRORS[status] ??
            (status >= 500 && status <= 599
                ? ["AIProviderUnavailable", "Sreevi's AI service is temporarily unavailable. Please try again shortly."]
                : ["AIServiceError", "Sreevi couldn't write the message. Please try again."]);

        return json(500, "Internal Server Error", { success: false, error: errorCode, message });
    }
}