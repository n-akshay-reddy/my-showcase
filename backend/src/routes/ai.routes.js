import { handleAIRequest } from "../controllers/ai.controller.js";

export async function aiRoutes(request, env, ctx) {

    if (request.method === "POST" && request.url.endsWith("/api/ai")) {
        return handleAIRequest(request, env, ctx);
    }

    return new Response("Not Found", {status: 404});
}