import { TOOLS } from "./tools/index.js";

export const DECISION_TYPES = ["answer", "clarify", "execute", "decline"];
export const TOPICS = ["leetcode", "theme", "navigation", "portfolio", "general"];

const MAX_MESSAGE_LENGTH = 1000;

export function parseDecision(text) {
    try {
        const cleaned = String(text).replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

function validateToolArgs(definition, args) {
    const errors = [];

    if (typeof args !== "object" || args === null || Array.isArray(args)) {
        return [`Arguments for ${definition.name} must be an object.`];
    }

    const rules = definition.args ?? {};

    for (const key of Object.keys(args)) {
        if (!(key in rules)) {
            errors.push(`Argument "${key}" is not allowed for ${definition.name}.`);
        }
    }

    for (const [key, rule] of Object.entries(rules)) {
        const value = args[key];

        if (value === undefined || value === null) {
            if (rule.required) {
                errors.push(`Argument "${key}" is required for ${definition.name}.`);
            }
            continue;
        }

        if (rule.type && typeof value !== rule.type) {
            errors.push(`Argument "${key}" must be a ${rule.type}.`);
            continue;
        }

        if (rule.values && !rule.values.includes(value)) {
            errors.push(`Argument "${key}" must be one of: ${rule.values.join(", ")}.`);
        }
    }

    return errors;
}

export function validateDecision(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return { valid: false, errors: ["Decision must be a JSON object."] };
    }

    const errors = [];
    const { type, message, topic, intent, params, tool } = input;

    if (!DECISION_TYPES.includes(type)) {
        errors.push(`type must be one of: ${DECISION_TYPES.join(", ")}.`);
    }

    if (typeof message !== "string" || !message.trim()) {
        errors.push("message must be a non-empty string.");
    } else if (message.length > MAX_MESSAGE_LENGTH) {
        errors.push(`message must not exceed ${MAX_MESSAGE_LENGTH} characters.`);
    }

    if (!TOPICS.includes(topic)) {
        errors.push(`topic must be one of: ${TOPICS.join(", ")}.`);
    }

    if (intent != null && typeof intent !== "string") {
        errors.push("intent must be a string or null.");
    }

    if (params != null && (typeof params !== "object" || Array.isArray(params))) {
        errors.push("params must be an object or null.");
    }

    let cleanTool = null;

    if (type === "execute") {
        const definition = tool && typeof tool.name === "string" ? TOOLS[tool.name] : null;

        if (!definition) {
            errors.push("tool.name is missing or is not an allowed tool.");
        } else {
            const args = tool.args ?? {};
            errors.push(...validateToolArgs(definition, args));
            cleanTool = { name: definition.name, args, runsOn: definition.runsOn };
        }
    } else if (tool != null) {
        errors.push("tool must be null unless type is execute.");
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        decision: {
            type,
            message: message.trim(),
            topic,
            intent: intent ?? null,
            params: params ?? {},
            tool: cleanTool
        }
    };
}