export const composeEmailTool = {
    execute(args) {
        const subject = (args?.subject ?? "").slice(0, 200);
        const body = (args?.body ?? "").slice(0, 1500);

        const query = [
            "view=cm",
            "fs=1",
            `to=${encodeURIComponent(import.meta.env.VITE_CONTACT_EMAIL)}`,
        ];
        if (subject) query.push(`su=${encodeURIComponent(subject)}`);
        if (body) query.push(`body=${encodeURIComponent(body)}`);

        const url = `https://mail.google.com/mail/?${query.join("&")}`;

        return {
            ok: true,
            changed: true,
            message: `Opening Gmail with your draft in ${import.meta.env.VITE_PROFILE_REDIRECT_DELAY_MS / 1000} seconds. If nothing opens, use the link below.`,
            link: { href: url, label: "Open Gmail draft" },
            delayMs: import.meta.env.VITE_PROFILE_REDIRECT_DELAY_MS,
            after: () => window.open(url, "_blank", "noopener,noreferrer"),
        };
    },
};