const PROFILE_LABELS = {
    linkedin: "LinkedIn",
    github: "GitHub",
    instagram: "Instagram",
    resume: "the resume",
    leetcode: "the LeetCode profile"
};

export const openProfile = {
    name: "openProfile",
    topic: "navigation",
    runsOn: "frontend",
    terminal: true,
    label: ({ profile }) => `Opening ${PROFILE_LABELS[profile] ?? profile}`,
    description:
    "Open one of Akshay's external profiles in a new tab: linkedin, github, instagram, " +
    "resume (PDF), or leetcode (his external LeetCode account). " +
    "Use only when the user asks to open, show or visit it. " +
    "If the user says only 'leetcode', do not guess: ask whether they mean his LeetCode profile " +
    "or the LeetCode dashboard on this site (navigateToPage 'leetcode').",
    args: {
        profile: {
            type: "string",
            values: ["linkedin", "github", "instagram", "resume", "leetcode"],
            required: true
        }
    }
};