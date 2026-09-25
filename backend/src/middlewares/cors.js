export function handleCors(request, env) {

    const origin = request.headers.get("Origin");
    console.log("Request Origin:", origin);
    console.log("Allowed Origin:", env.ALLOWED_ORIGIN);
    if (origin !== env.ALLOWED_ORIGIN) {
        console.log("CORS ERROR");
        console.log("Received Origin:", origin);
        console.log("Allowed Origin:", env.ALLOWED_ORIGIN);
        console.log("Response Message:", "Origin not allowed");
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