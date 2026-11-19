const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

async function requestSreevi(endpoint, payload, signal) {
    if (!API_BASE_URL) {
        throw new Error("The backend API URL is not configured.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
    });

    let result;

    try {
        result = await response.json();
    } catch {
        if (signal?.aborted) {
            throw new DOMException("The request was aborted.", "AbortError");
        }
        throw new Error("Sreevi returned an invalid response.");
    }

    if (!response.ok || !result?.success) {
        throw new Error(
            result?.error?.message ||
            result?.message ||
            "Sreevi could not process the request."
        );
    }

    return result.data;
}

export function sendSreeviMessage(message, context, signal) {
    return requestSreevi("/api/ai", { message, context }, signal);
}

export function composeWithSreevi(payload, signal) {
    return requestSreevi("/api/ai/compose", payload, signal);
}