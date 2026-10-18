export const openProfile = {
    name: "openProfile",
    topic: "navigation",
    runsOn: "frontend",
    description:
        "Open one of Akshay's external profiles in a new tab: linkedin, github, instagram, " +
        "resume (PDF), or leetcode (his external LeetCode account). " +
        "Use only when the user asks to open, show or visit it. " +
        "Do NOT use for the portfolio's own LeetCode dashboard page (that is navigateToPage 'leetcode'). " +
        "If the user just says 'leetcode' and it is unclear which they mean, ask: dashboard here or LeetCode profile?",
    args: {
        profile: {
            type: "string",
            values: ["linkedin", "github", "instagram", "resume", "leetcode"],
            required: true
        }
    }
};