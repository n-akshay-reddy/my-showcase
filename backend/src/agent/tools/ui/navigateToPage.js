const PAGE_LABELS = {
    home: "Home",
    leetcode: "LeetCode dashboard",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    achievements: "Achievements",
    opensource: "Open Source",
    contact: "Contact",
    more: "More"
};

export const navigateToPage = {
    name: "navigateToPage",
    topic: "navigation",
    runsOn: "frontend",
    terminal: true,
    label: ({ page }) => `Opening ${PAGE_LABELS[page] ?? page}`,
    description:
        "Navigate to a page of the portfolio. " +
        "Pages: home, leetcode (the LeetCode dashboard on this site), " +
        "experience, education (About menu); " +
        "projects, achievements, opensource (Showcase menu); " +
        "contact; more (the More section). " +

        "The More section contains all personal information, including " +
        "strengths, values, engineering principles, off-the-clock activities, " +
        "hobbies, interests and fascinations. " +

        "If the user asks about strengths, values, principles, hobbies, " +
        "interests, free-time activities or fascinations, navigate to 'more'. " +

        "If the user asks for About or Showcase without specifying a page, " +
        "ask which page they mean. " +

        "If the user asks for More or any subsection within More, " +
        "navigate directly to 'more'. " +

        "If the user says only 'leetcode', do not guess: ask whether they mean " +
        "the dashboard here or Akshay's external LeetCode profile. " +

        "Only navigate when the user explicitly asks to go to or open a page.",
    args: {
        page: {
            type: "string",
            values: [
                "home", 
                "leetcode",
                "experience", "education",
                "projects", "achievements", "opensource",
                "contact",
                "more"
            ],
            required: true
        }
    }
};