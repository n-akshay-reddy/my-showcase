import { handleRoutes } from "./routes/index.js";
import { handleCors } from "./middlewares/cors.js";

export default {
    async fetch(request, env, ctx) {

        const corsResponse = handleCors(request, env);

        if (corsResponse) {
            return corsResponse;
        }

        const response = await handleRoutes(request, env, ctx);
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", request.headers.get("Origin"));
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    }
};