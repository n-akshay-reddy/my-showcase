import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    { id: "home", label: "Home", to: "/" },
    { id: "leetcode", label: "<Leetcode/>", to: "/leetcode" },
    {
        label: "About",
        paths: ["/about"],
        children: [
            { id: "experience", to: "/about/Experience", label: "Experience" },
            { id: "education", to: "/about/education", label: "Education" },
            { id: "skills", to: "/about/skills", label: "Skills" },
        ],
    },
    {
        label: "Showcase",
        paths: ["/showcase"],
        children: [
            { id: "projects", to: "/showcase/projects", label: "Projects" },
            { id: "achievements", to: "/showcase/achievements", label: "Achievements" },
        ],
    },
    { id: "contact", label: "Contact", to: "/contact" },
    {
        label: "More",
        paths: ["/more"],
        children: [
            { id: "interests", to: "/more/interests", label: "Interests" },
            { id: "hobbies", to: "/more/hobbies", label: "Hobbies" },
        ],
    },
];

const navBarSlice = createSlice({
    name: "navBar",
    initialState,
    reducers: {},
})

export default navBarSlice.reducer;
