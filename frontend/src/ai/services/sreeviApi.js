
const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export async function sendSreeviMessage(message) {
    if (!API_BASE_URL) {
        throw new Error("The backend API URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}/api/ai`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Unable to get a response from Sreevi."
        );
    }

    return result.data;
}
