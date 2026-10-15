import { runAgent } from "../agent/ai.agent";

export async function handleAIRequest(request, env, ctx) {
    try {
        const body = await request.json();
        const message = body?.message;

        if (typeof message !== "string" || !message.trim()) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "MessageRequired",
                    message: "A non-empty message is required."
                }),
                {
                    status: 400,
                    statusText: "Bad Request",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (message.length > 2000) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "MessageTooLong",
                    message: "The message must not exceed 2000 characters."
                }),
                {
                    status: 400,
                    statusText: "Bad Request",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const result = await runAgent(message.trim(), env);

        return new Response(
            JSON.stringify({
                success: true,
                data: result
            }),
            {
                status: 200,
                statusText: "OK",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        console.error("Sreevi AI request failed:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: "AIServiceUnavailable",
                message: "Unable to process your request right now."
            }),
            {
                status: 500,
                statusText: "Internal Server Error",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}