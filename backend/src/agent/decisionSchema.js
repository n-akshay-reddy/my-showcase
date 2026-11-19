import { TOOLS } from "./tools/index.js";

export const DECISION_TYPES = ["answer", "clarify", "execute", "decline"];
export const TOPICS = ["leetcode", "theme", "navigation", "portfolio", "general", "contact"];

// Keep these in step with frontend/src/ai/config/chatConfig.js
const MAX_MESSAGE_LENGTH = 1000;
const MAX_TOOLS = 4;
const MAX_NOTE_LENGTH = 200;

const clip = (text, max) => String(text ?? "").replace(/\s+/g, " ").trim().slice(0, max);

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

// Every tool is checked against the registry. Topic, label, terminal and runsOn come
// from the registry, never from the model.
function cleanTools(rawTools, errors) {
    if (!Array.isArray(rawTools)) {
        errors.push("tools must be an array.");
        return [];
    }
    if (rawTools.length > MAX_TOOLS) {
        errors.push(`tools must not exceed ${MAX_TOOLS} items.`);
        return [];
    }

    const cleaned = [];

    rawTools.forEach((tool, i) => {
        const definition = tool && typeof tool.name === "string" ? TOOLS[tool.name] : null;

        if (!definition) {
            errors.push(`tools[${i}].name is missing or is not an allowed tool.`);
            return;
        }

        const args = tool.args ?? {};
        const argErrors = validateToolArgs(definition, args);

        if (argErrors.length > 0) {
            errors.push(...argErrors);
            return;
        }

        cleaned.push({
            name: definition.name,
            args,
            topic: definition.topic,
            label: typeof definition.label === "function" ? definition.label(args) : definition.label ?? definition.name,
            terminal: Boolean(definition.terminal),
            runsOn: definition.runsOn,
        });
    });

    // One terminal tool at most (opens a page or tab), and it always runs last
    const terminals = cleaned.filter((tool) => tool.terminal);
    if (terminals.length > 1) {
        errors.push("Only one terminal tool is allowed per request.");
        return [];
    }
    return [...cleaned.filter((tool) => !tool.terminal), ...terminals];
}

// A clarify question carries the tools still waiting for missing details
function cleanPending(rawPending, errors) {
    if (rawPending == null) return [];
    if (!Array.isArray(rawPending)) {
        errors.push("pending must be an array.");
        return [];
    }

    return rawPending.slice(0, MAX_TOOLS).flatMap((item) => {
        const name = item && typeof item.tool === "string" ? item.tool : null;

        if (!name || !TOOLS[name]) {
            errors.push("pending[].tool must be an allowed tool.");
            return [];
        }

        const args = item.args && typeof item.args === "object" && !Array.isArray(item.args) ? item.args : {};
        const missing = Array.isArray(item.missing)
            ? item.missing.filter((key) => typeof key === "string").slice(0, 5)
            : [];

        return [{ tool: name, args, missing }];
    });
}

export function validateDecision(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return { valid: false, errors: ["Decision must be a JSON object."] };
    }

    const errors = [];
    const { type, message, ask, note, tools, pending } = input;

    if (!DECISION_TYPES.includes(type)) {
        errors.push(`type must be one of: ${DECISION_TYPES.join(", ")}.`);
    }

    if (typeof message !== "string" || !message.trim()) {
        errors.push("message must be a non-empty string.");
    } else if (message.length > MAX_MESSAGE_LENGTH) {
        errors.push(`message must not exceed ${MAX_MESSAGE_LENGTH} characters.`);
    }

    if (ask != null && typeof ask !== "string") errors.push("ask must be a string or null.");
    if (note != null && typeof note !== "string") errors.push("note must be a string or null.");

    let cleanList = [];

    if (type === "execute") {
        if (!Array.isArray(tools) || tools.length === 0) {
            errors.push("execute needs at least one tool.");
        } else {
            cleanList = cleanTools(tools, errors);
        }
    } else if (Array.isArray(tools) && tools.length > 0) {
        errors.push("tools must be empty unless type is execute.");
    }

    const cleanPendingList = type === "clarify" ? cleanPending(pending, errors) : [];

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        decision: {
            type,
            message: message.trim(),
            ask: clip(ask, MAX_NOTE_LENGTH),
            note: clip(note, MAX_NOTE_LENGTH),
            tools: cleanList,
            pending: cleanPendingList,
        },
    };
}