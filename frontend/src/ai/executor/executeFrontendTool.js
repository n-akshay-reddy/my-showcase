import { frontendTools } from "../tools";

export function executeFrontendTool(tool, deps) {
    const implementation = frontendTools[tool?.name];

    if (!implementation) {
        return { ok: false, message: "I can't do that action." };
    }

    try {
        return implementation.execute(tool.args ?? {}, deps);
    } catch (error) {
        return { ok: false, message: "That action didn't work. Please try again." };
    }
}