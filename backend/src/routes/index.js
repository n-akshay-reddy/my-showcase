import { aiRoutes } from "./ai.routes.js";

export async function handleRoutes(request, env, ctx) {

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/ai")) {
        return aiRoutes(request, env, ctx);
    }
    
    return new Response("Not Found", {status: 404});
}