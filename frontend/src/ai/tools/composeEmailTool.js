import { CHAT_CONFIG } from "../config/chatConfig";

export const composeEmailTool = {
    execute(args) {
        const email = import.meta.env.VITE_CONTACT_EMAIL;
        if (!email) {
            return { ok: false, message: "The contact email isn't configured." };
        }

        const subject = (args?.subject ?? "").slice(0, 200);
        const body = (args?.body ?? "").slice(0, 1500);

        const query = ["view=cm", "fs=1", `to=${encodeURIComponent(email)}`];
        if (subject) query.push(`su=${encodeURIComponent(subject)}`);
        if (body) query.push(`body=${encodeURIComponent(body)}`);

        const url = `https://mail.google.com/mail/?${query.join("&")}`;
        const seconds = Math.round(CHAT_CONFIG.terminalDelayMs / 1000);

        return {
            ok: true,
            changed: true,
            message: `Opening Gmail in ${seconds} seconds. If nothing opens, use the link.`,
            doneMessage: "Opened Gmail.",
            link: { href: url, label: "Open Gmail draft" },
            delayMs: CHAT_CONFIG.terminalDelayMs,
            after: () => window.open(url, "_blank", "noopener,noreferrer"),
        };
    },
};