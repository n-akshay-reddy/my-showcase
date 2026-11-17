export async function profileRoutes(request, env, ctx) {
    
    if (request.method !== "GET") {
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

    const path = new URL(request.url).pathname;

    switch (path) {
        case "/api/profile/experience":
            return getExperience(request, env, ctx);

        case "/api/profile/projects":
            return getProjects(request, env, ctx);

        case "/api/profile/skills":
            return getSkills(request, env, ctx);

        default:
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "RouteNotFound",
                    message: `The requested profile endpoint '${path}' was not found.`
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
}
