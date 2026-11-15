export const setTheme = {
    name: "setTheme",
    topic: "theme",
    runsOn: "frontend",
    terminal: false,
    label: ({ theme }) => theme === "toggle" ? "Switching the theme" : `Switching to ${theme.replace("-", " ")}`,
    description:
        "Change the portfolio theme. Use 'dark-mode' or 'light-mode' when the user names a theme. " +
        "Use 'toggle' when the user asks to change, switch " +
        "or toggle the theme without naming one.",
    args: {
        theme: {
            type: "string",
            values: ["dark-mode", "light-mode", "toggle"],
            required: true
        }
    }
};