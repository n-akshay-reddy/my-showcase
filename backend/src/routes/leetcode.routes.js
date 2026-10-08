import { getProfile,getCalendar } from "../controllers/leetcode.controller";

export async function leetcodeRoutes(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

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

    // GET /api/leetcode/:username/profile
    const profileMatch = path.match(/^\/api\/leetcode\/([^/]+)\/profile$/);

    if (profileMatch) {
        const username = profileMatch[1];
        return getProfile(username,url.searchParams, env);
    }

    // GET /api/leetcode/:username/calendar
    const calendarMatch = path.match(/^\/api\/leetcode\/([^/]+)\/calendar$/);

    if (calendarMatch) {
        const username = calendarMatch[1];
        return getCalendar(username, url.searchParams, env);
    }

    return new Response(
        JSON.stringify({
            success: false,
            error: "RouteNotFound",
            message: `The requested LeetCode API endpoint '${path}' was not found.`
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