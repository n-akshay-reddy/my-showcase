export function handleCors(request, env) {

    const origin = request.headers.get("Origin");

    if (origin !== env.ALLOWED_ORIGIN) {
        return new Response("Origin not allowed", {
            status: 403
        });
    }

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    return null;
}