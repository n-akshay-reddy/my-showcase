import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: {
        "name": "Akshay Kumar Reddy Nanobolu",
        "knownAs": "Akshay",
        "headline": "Software engineer building enterprise Salesforce products, full-stack apps and AI agents",
        "summary": "I'm a product-oriented software engineer who works across enterprise Salesforce engineering, full-stack development and applied AI. I enjoy tracing hard problems to their root cause, optimizing resource-heavy systems and turning complex logic into reusable, maintainable code.",
        "roles": [
            "Salesforce product developer",
            "Full-stack developer",
            "AI application and agent developer"
        ],
        "careerDirection": "I want to grow into an engineer who designs architectures, solves hard technical constraints and brings AI into practical software products.",
        "strengths": [
            {
                "title": "Problem Solving",
                "group": "thinking",
                "icon": "🧩",
                "text": "I break big problems into small steps and solve them one by one."
            },
            {
                "title": "Debugging",
                "group": "thinking",
                "icon": "🐞",
                "text": "I stay calm, find the cause and fix it properly."
            },
            {
                "title": "Critical Thinking",
                "group": "thinking",
                "icon": "🔍",
                "text": "I ask why before I build, so the solution fits the real need."
            },
            {
                "title": "Ownership",
                "group": "drive",
                "icon": "🛡️",
                "text": "What I build is mine, and I stand behind it."
            },
            {
                "title": "Quick Learner",
                "group": "drive",
                "icon": "⚡",
                "text": "I pick up new tools fast and keep going deeper."
            },
            {
                "title": "Self-Motivated",
                "group": "drive",
                "icon": "🔥",
                "text": "I don't wait to be told. I find what's next and start."
            },
            {
                "title": "Adaptability",
                "group": "drive",
                "icon": "🌊",
                "text": "When plans change, I adjust and keep moving."
            },
            {
                "title": "Time Management",
                "group": "teamwork",
                "icon": "⏱️",
                "text": "I plan in small steps so deadlines stay realistic."
            },
            {
                "title": "Team Collaboration",
                "group": "teamwork",
                "icon": "🤝",
                "text": "I share early and help teammates move forward."
            },
            {
                "title": "Team Management",
                "group": "teamwork",
                "icon": "👥",
                "text": "I keep everyone clear on who does what and what's next."
            },
            {
                "title": "Active Participation",
                "group": "teamwork",
                "icon": "🙌",
                "text": "I join in fully and bring ideas, not just updates."
            }
        ],
        "engineeringPrinciples": [	
            {
                "title": "Research before building",
                "summary": "I understand how a system really behaves before choosing a solution."
            },
            {
                "title": "Fix the root cause",
                "summary": "I investigate the underlying cause of a problem and implement solutions that prevent it from recurring."
            },
            {
                "title": "Design for reuse",
                "summary": "I prefer clear abstractions that other developers can use without knowing the internals."
            },
            {
                "title": "Respect resources",
                "summary": "I watch memory, queries and processing cost, and ask whether a workload belongs inside a constrained environment."
            },
            {
                "title": "Protect existing behavior",
                "summary": "I consider backward compatibility and regression risk whenever shared code changes."
            },
            {
                "title": "Security by design",
                "summary": "I consider security from the beginning, ensuring that data access, permissions and system boundaries are protected by design."
            }
        ],
        "values": [
            {
                "id": 1,
                "choose": "Consistency",
                "over": "motivation",
                "scene": "dawn",
                "tagline": "Show up. Every single day.",
                "description": "My 160-day LeetCode streak came from habit, not motivation."
            },
            {
                "id": 2,
                "choose": "Progress",
                "over": "complacency",
                "scene": "morning",
                "tagline": "Never stop becoming better.",
                "description": "There is always room to grow, so I keep learning and improving."
            },
            {
                "id": 3,
                "choose": "Ownership & Accountability",
                "over": "excuses",
                "scene": "midday",
                "tagline": "If it's mine, it's on me.",
                "description": "I own my work and its results. When something goes wrong, I fix it."
            },
            {
                "id": 4,
                "choose": "Resilience Through Challenges",
                "over": "giving up",
                "scene": "storm",
                "tagline": "Hard is part of the journey.",
                "description": "I stay calm, take problems one step at a time and keep going."
            },
            {
                "id": 5,
                "choose": "Learning From Failures",
                "over": "regret",
                "scene": "goldenHour",
                "tagline": "Every setback has something to teach.",
                "description": "A failed attempt shows me what to do better next time."
            },
            {
                "id": 6,
                "choose": "Intellectual Curiosity",
                "over": "assumptions",
                "scene": "dusk",
                "tagline": "Question. Explore. Understand.",
                "description": "I like knowing how things work instead of taking them at face value."
            },
            {
                "id": 7,
                "choose": "Teamwork & Collaboration",
                "over": "working in isolation",
                "scene": "summitNight",
                "tagline": "We build better together.",
                "description": "Different views and open talk lead to better solutions."
            }
        ],
        "offTheClock": [
            {
                "title": "Hockey",
                "icon": "🏑",
                "description": "Stick, speed and split-second calls."
            },
            {
                "title": "Running",
                "icon": "🏃",
                "description": "Just me, the road and a steady pace."
            },
            {
                "title": "Football",
                "icon": "⚽",
                "description": "Best played with a team that talks."
            },
            {
                "title": "Cricket",
                "icon": "🏏",
                "description": "Bat, ball and a stubborn streak."
            },
            {
                "title": "Gym",
                "icon": "🏋️",
                "description": "Showing up is the whole workout."
            }
        ],
        "hobbies": [
            { "title": "Long Drives", "icon": "🚗" },
            { "title": "Watching Movies", "icon": "🎬" },
            { "title": "Listening to Music", "icon": "🎧" },
            { "title": "Watching Cricket", "icon": "🏏" },
            { "title": "Enjoying My Own Company", "icon": "🌿" },
            { "title": "Travelling & Exploring", "icon": "🧭" }
        ],
        "passions": [
            {
                "title": "Problem Solving & Puzzles",
                "icon": "🧩",
                "description": "I enjoy figuring out tricky problems and puzzles."
            },
            {
                "title": "Logical Thinking",
                "icon": "🧠",
                "description": "I like thinking things through step by step to reach a clear answer."
            },
            {
                "title": "Competitive Activities",
                "icon": "🏆",
                "description": "A friendly challenge motivates me to do my best."
            },
            {
                "title": "Technology & Innovation",
                "icon": "🚀",
                "description": "I love learning about new technology."
            },
            {
                "title": "Building & Creating Things",
                "icon": "🛠️",
                "description": "I enjoy turning an idea into something people can actually use."
            }
        ]
    },
    status: "loaded",
    error: null,
    activeTab: 0,
    selectedStrength: 0,
    activeValue: 0,
};

const moreSlice = createSlice({
    name: "more",
    initialState,
    reducers: {
        setMoreLoading(state) {
            state.status = "loading";
            state.error = null;
        },
        setMoreData(state, action) {
            state.data = action.payload;
            state.status = "loaded";
            state.error = null;
        },
        setMoreError(state, action) {
            state.status = "error";
            state.error = action.payload;
        },
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
        setSelectedStrength(state, action) {
            state.selectedStrength = action.payload;
        },
        setActiveValue(state, action) {
        state.activeValue = action.payload;
    },
    },
});

export const { setMoreLoading, setMoreData, setMoreError, setActiveTab, setSelectedStrength, setActiveValue } = moreSlice.actions;
export default moreSlice.reducer;