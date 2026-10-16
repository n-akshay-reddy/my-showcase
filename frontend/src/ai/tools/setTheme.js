import { store } from "../../state-management/store/store";
import { setTheme } from "../../state-management/theme/themeSlice";

const ALLOWED = ["dark-mode", "light-mode"];

export const setThemeTool = {
    execute(args) {
        if (!ALLOWED.includes(args?.theme)) {
            return { ok: false, message: "That theme isn't supported." };
        }

        const label = args.theme.replace("-", " ");        
        const current = store.getState().theme.mode;  

        if (current === args.theme) {
            return { ok: true, changed: false, message: `The site is already in ${label}.` };
        }

        store.dispatch(setTheme(args.theme));
        return { ok: true, changed: true, message: `Switched to ${label}.` };
    }
};