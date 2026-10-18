import { profile } from "../../data/profile";

export const openProfileTool = {
    execute(args) {
        const item = profile.find((p) => p.name.toLowerCase() === args?.profile);
        if (!item) {
            return { ok: false, message: "I couldn't find that profile." };
        }

        return {
            ok: true,
            changed: true,
            message: `Opening ${item.name} in ${import.meta.env.VITE_PROFILE_REDIRECT_DELAY_MS / 1000} seconds. If nothing opens, use the link below.`,
            link: { href: item.href, label: `Open ${item.name}` },
            delayMs: import.meta.env.VITE_PROFILE_REDIRECT_DELAY_MS,
            after: () => window.open(item.href, "_blank", "noopener,noreferrer"),
        };
    },
};