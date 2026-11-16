import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    { id: "home", label: "Home", to: "/" },
    { id: "leetcode", label: "<Leetcode/>", to: "/leetcode" },
    {
        label: "About",
        paths: ["/about"],
        children: [
            { id: "experience", to: "/about/experience", label: "Experience" },
            { id: "education", to: "/about/education", label: "Education" },
        ],
    },
    {
        label: "Showcase",
        paths: ["/showcase"],
        children: [
            { id: "projects", to: "/showcase/projects", label: "Projects" },
            { id: "achievements", to: "/showcase/achievements", label: "Achievements" },
            { id: "opensource", to: "/showcase/opensource", label: "Open Source" }
        ],
    },
    { id: "contact", label: "Contact", to: "/contact" },
    { id: "more",  label: "More",  to: "/more"},
];

const navBarSlice = createSlice({
    name: "navBar",
    initialState,
    reducers: {},
})

export default navBarSlice.reducer;
