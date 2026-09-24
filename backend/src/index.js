import { handleRoutes } from "./routes/index.js";
import { handleCors } from "./middleware/cors.js";

export default {
    async fetch(request, env, ctx) {

        const corsResponse = handleCors(request, env);

        if (corsResponse) {
            return corsResponse;
        }

        const response = await handleRoutes(request, env, ctx);
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin",request.headers.get("Origin"));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    }
};