export const setTheme = {
    name: "setTheme",
    topic: "theme",
    runsOn: "frontend",
    description: "Set the portfolio theme. For requests like 'toggle' or 'switch the theme', pick the opposite of context.currentTheme.",
    args: {
        theme: { 
            type: "string",
            values: ["dark-mode", "light-mode"],
            required: true 
        }
    } 
};