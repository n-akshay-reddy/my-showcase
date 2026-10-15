import { handleAIRequest } from "../controllers/ai.controller.js";

export async function aiRoutes(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({
                success: false,
                error: "MethodNotAllowed",
                message: `The ${request.method} method is not allowed for this endpoint.`
            }),
            {
                status: 405,
                statusText: "Method Not Allowed",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    if (path === "/api/ai") {
        return handleAIRequest(request, env, ctx);
    }

    return new Response(
        JSON.stringify({
            success: false,
            error: "RouteNotFound",
            message: `The requested AI API endpoint '${path}' was not found.`
        }),
        {
            status: 404,
            statusText: "Not Found",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}