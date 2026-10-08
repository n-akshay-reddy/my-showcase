import { aiRoutes } from "./ai.routes.js";
import { leetcodeRoutes } from "./leetcode.routes.js";

export async function handleRoutes(request, env, ctx) {

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/ai")) {
        return aiRoutes(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/leetcode")) {
        return leetcodeRoutes(request, env, ctx);
    }
    
    return new Response(
        JSON.stringify({
            success: false,
            error: "RouteNotFound",
            message: `The requested API endpoint '${url.pathname}' was not found.`
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