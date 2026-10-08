import { GET_USER_FULL_PROFILE,GET_USER_CALENDAR } from "../queries/leetcode/graphql/users.queries";


export async function getProfile(username, searchParams, env) {

    try {
        const response = await fetch(env.LEETCODE_GRAPHQL_URL, {method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({query: GET_USER_FULL_PROFILE,variables: {username}})
        });

        const result = await response.json();

        if (result.errors) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "LeetCodeGraphQLError",
                    message: result.errors[0]?.message || "LeetCode returned an unknown error."
                }),
                {
                    status: 502,
                    statusText: "Bad Gateway",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({success: true,data: result.data}),
            {
                status: 200,
                statusText: "OK",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "LeetCodeServiceUnavailable",
                message: "Unable to fetch profile data from LeetCode."
            }),
            {
                status: 502,
                statusText: "Bad Gateway",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}


export async function getCalendar(username, searchParams, env) {

    const year = searchParams.get("year");

    if (!year) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "YearRequired",
                message: "The 'year' query parameter is required."
            }),
            {
                status: 400,
                statusText: "Bad Request",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    const parsedYear = Number(year);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > currentYear) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "InvalidYear",
                message: `The 'year' must be an integer between 2000 and ${currentYear}.`
            }),
            {
                status: 400,
                statusText: "Bad Request",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {
        const response = await fetch(env.LEETCODE_GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: GET_USER_CALENDAR,
                variables: {
                    username,
                    year: parsedYear
                }
            })
        });

        const result = await response.json();

        if (result.errors) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "LeetCodeGraphQLError",
                    message: result.errors[0]?.message || "LeetCode returned an unknown error."
                }),
                {
                    status: 502,
                    statusText: "Bad Gateway",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: result.data
            }),
            {
                status: 200,
                statusText: "OK",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "LeetCodeServiceUnavailable",
                message: "Unable to fetch calendar data from LeetCode."
            }),
            {
                status: 502,
                statusText: "Bad Gateway",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}