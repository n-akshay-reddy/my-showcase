// All default values for the Contact page.

export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "akshaynanobolu@gmail.com";
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Sreevi prompt: no hard stop, the visitor is warned once they go past this.
export const PROMPT_MAX = 500;

export const LOCATION = "Hyderabad, Telangana, India";
export const LOCATION_NOTE = "Open to work anywhere · remote or relocation";

export const RESUME_URL = "https://n-akshay-reddy.github.io/resume/index.pdf";
export const RESUME_FILE = "N_Akshay_Kumar_Reddy_Resume.pdf";

// fill = hover colour of the pill, glow = shadow under it
export const SOCIALS = [
    { name: "LinkedIn", handle: "n-akshay-reddy", href: "https://www.linkedin.com/in/n-akshay-reddy/", fill: "#0a66c2", glow: "#0a66c2" },
    { name: "GitHub", handle: "n-akshay-reddy", href: "https://github.com/n-akshay-reddy", fill: "linear-gradient(135deg,#6e5494,#24292f)", glow: "#6e5494" },
    { name: "LeetCode", handle: "n-akshay-reddy", href: "https://leetcode.com/u/n-akshay-reddy/", fill: "#f59e0b", glow: "#f59e0b" },
    { name: "Instagram", handle: "n_akshay_reddy", href: "https://www.instagram.com/n_akshay_reddy/", fill: "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)", glow: "#dd2a7b" },
];

// {name} becomes the visitor's name, or "[Your name]" if they left it empty.
export const TOPICS = [
    {
        id: "job",
        label: "Job opportunity",
        subject: "An opportunity we would like to discuss with you",
        body: "Dear Akshay,\n\nI hope you are doing well. I came across your portfolio and was genuinely impressed by your work. We are looking for someone with your skills, and we would be delighted to explore how you might fit with our team.\n\nWould you be open to a short conversation at a time that suits you? I would be happy to share more about the role.\n\nWarm regards,\n{name}",
    },
    {
        id: "project",
        label: "Project",
        subject: "A project we would love to work on with you",
        body: "Dear Akshay,\n\nI hope this message finds you well. We have a project that we believe would be a great fit for your skills, and we would be glad to work with you on it.\n\nMay I share a short brief and hear your thoughts?\n\nThank you for your time.\n\nKind regards,\n{name}",
    },
    {
        id: "collab",
        label: "Collaboration",
        subject: "Let’s build something good together",
        body: "Dear Akshay,\n\nI hope you are well. I have enjoyed seeing your work, and I think we could create something really good together.\n\nI would love to hear your thoughts on a possible collaboration whenever you have a moment.\n\nLooking forward to hearing from you.\n\nBest regards,\n{name}",
    },
    {
        id: "hi",
        label: "Just saying hi",
        subject: "A warm hello from your portfolio",
        body: "Dear Akshay,\n\nI hope you are doing well. I recently visited your portfolio and wanted to say how much I enjoyed it.\n\nWishing you all the best with your work ahead.\n\nWarm regards,\n{name}",
    },
];