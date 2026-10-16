import { store } from "../../state-management/store/store";

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
        const path = buildRouteMap(store.getState().navBar)[args?.page];

        if (!path) {
            return { ok: false, message: "I can't open that page." };
        }

        if (window.location.pathname.toLowerCase() === path.toLowerCase()) {
            return { ok: true, changed: false, message: `You're already on the ${args.page} page.` };
        }

        navigate(path);
        return { ok: true, changed: true, message: `Opened the ${args.page} page.` };
    }
};