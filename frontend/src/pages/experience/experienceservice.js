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

export async function getExperience() {
    const response = await fetch(`${SERVER_BASE_URL}/api/profile/experience`);
    const data = await parseResponse(response);
    const companies = data?.data ?? data; 

    if (!Array.isArray(companies)) {
        throw new Error("Invalid experience data received from the server.");
    }
    return companies;
}