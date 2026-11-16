import { frontendTools } from "../tools";

export function executeFrontendTool(tool, deps) {
    const implementation = frontendTools[tool?.name];

    if (!implementation) {
        return { ok: false, message: "I can't do that action." };
    }

    try {
        const result = implementation.execute(tool.args ?? {}, deps);
        if (!result || typeof result !== "object") {
            return { ok: false, message: "That action didn't work. Please try again." };
        }
        return result;
    } catch (error) {
        return { ok: false, message: "That action didn't work. Please try again." };
    }
}