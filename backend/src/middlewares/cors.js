export function handleCors(request, env) {

    const origin = request.headers.get("Origin");
    if (origin !== env.ALLOWED_ORIGIN) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "OriginNotAllowed",
                message: "The request origin is not allowed."
            }),
            {
                status: 403,
                statusText: "Forbidden",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            statusText: "No Content",
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }

    return null;
}