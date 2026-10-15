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
        const status = Number(error?.status ?? error?.statusCode);

        console.error("Sreevi AI request failed:", {
            name: error?.name,
            status,
            message: error?.message,
        });

        let errorCode = "AIServiceError";
        let userMessage = "Sreevi couldn't complete your request. Please try again.";

        if (status === 400) {
            errorCode = "InvalidAIRequest";
            userMessage = "Sreevi couldn't process that request. Please try rephrasing it.";
        } else if (status === 401 || status === 403) {
            errorCode = "AIAuthenticationError";
            userMessage = "Sreevi is temporarily unable to access its AI service.";
        } else if (status === 404) {
            errorCode = "AIModelUnavailable";
            userMessage = "Sreevi's AI model is unavailable. Please try again later.";
        } else if (status === 429) {
            errorCode = "AIRateLimitExceeded";
            userMessage = "Sreevi is receiving too many requests right now. Please wait a moment and try again.";
        } else if (status >= 500 && status <= 599) {
            errorCode = "AIProviderUnavailable";
            userMessage = "Sreevi's AI service is temporarily unavailable. Please try again shortly.";
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: errorCode,
                message: userMessage
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