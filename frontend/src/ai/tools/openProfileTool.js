import { profile } from "../../data/profile";
import { CHAT_CONFIG } from "../config/chatConfig";

export const openProfileTool = {
    execute(args) {
        const item = profile.find((p) => p.name.toLowerCase() === args?.profile);
        if (!item) {
            return { ok: false, message: "I couldn't find that profile." };
        }

        const seconds = Math.round(CHAT_CONFIG.terminalDelayMs / 1000);

        return {
            ok: true,
            changed: true,
            message: `Opening ${item.name} in ${seconds} seconds. If nothing opens, use the link.`,
            doneMessage: `Opened ${item.name}.`,
            link: { href: item.href, label: `Open ${item.name}` },
            delayMs: CHAT_CONFIG.terminalDelayMs,
            after: () => window.open(item.href, "_blank", "noopener,noreferrer"),
        };
    },
};