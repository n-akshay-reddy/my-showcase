const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

async function parseResponse(response) {
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid response received from the server.");
    }

    if (!response.ok) {
        const message = data?.message || data?.error || "Something went wrong while fetching data from the server.";
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

export async function getLeetCodeProfile(username) {
    const response = await fetch(`${SERVER_BASE_URL}/api/leetcode/${encodeURIComponent(username)}/profile`);
    const data = await parseResponse(response);
    return data.data;
}

export async function fetchLeetCodeCalendar(username, year) {
    const response = await fetch(`${SERVER_BASE_URL}/api/leetcode/${encodeURIComponent(username)}/calendar?year=${encodeURIComponent(year)}`);
    const data = await parseResponse(response);
    return data.data;
}