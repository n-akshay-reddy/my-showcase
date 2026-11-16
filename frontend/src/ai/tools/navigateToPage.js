import { store } from "../../state-management/store/store";
import { CHAT_CONFIG } from "../config/chatConfig";

// Display names only. The routes themselves come from the nav bar in the store.
const PAGE_LABELS = {
    home: "Home",
    leetcode: "LeetCode dashboard",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    achievements: "Achievements",
    contact: "Contact",
    interests: "Interests",
    hobbies: "Hobbies",
};

const labelOf = (page) => PAGE_LABELS[page] ?? page;

// "/Projects/" and "/projects" are the same page; "" and "/" are both home
const normalize = (path) => (path.replace(/\/+$/, "") || "/").toLowerCase();

export function buildRouteMap(navItems) {
    const routes = {};
    for (const item of navItems) {
        if (item.id && item.to) routes[item.id] = item.to;
        for (const child of item.children ?? []) {
            if (child.id && child.to) routes[child.id] = child.to;
        }
    }
    return routes;
}

export const navigateToPageTool = {
    execute(args, { navigate }) {
        const page = args?.page;
        const path = buildRouteMap(store.getState().navBar)[page];

        if (!path) {
            return { ok: false, message: "I can't open that page." };
        }

        const label = labelOf(page);

        // Already there: nothing to do (the runner shows this as "skipped")
        if (normalize(window.location.pathname) === normalize(path)) {
            return { ok: true, changed: false, message: `You're already on the ${label} page.` };
        }

        const delayMs = CHAT_CONFIG.internalNavDelayMs;
        const seconds = Math.round(delayMs / 1000);

        return {
            ok: true,
            changed: true,
            message: seconds >= 1 ? `Taking you to ${label} in ${seconds} seconds.` : `Taking you to ${label}.`,
            doneMessage: `Opened ${label}.`,
            delayMs,
            after: () => navigate(path),
        };
    },
};