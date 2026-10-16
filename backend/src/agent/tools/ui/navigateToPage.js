export const navigateToPage = {
    name: "navigateToPage",
    topic: "navigation",
    runsOn: "frontend",
    description:
        "Navigate to a page of the portfolio. Pages: home, leetcode (LeetCode dashboard), " +
        "experience, education, skills (About menu); projects, achievements (Showcase menu); " +
        "contact; interests, hobbies (More menu). " +
        "If the user asks for About, Showcase or More without a specific page, ask which page they mean. " +
        "Only navigate when the user explicitly asks to go to or open a page.",
    args: {
        page: {
            type: "string",
            values: [
                "home", "leetcode",
                "experience", "education", "skills",
                "projects", "achievements",
                "contact",
                "interests", "hobbies"
            ],
            required: true
        }
    }
};