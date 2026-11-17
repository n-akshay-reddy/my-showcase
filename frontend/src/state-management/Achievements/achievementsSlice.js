import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: [
        {
            id: "smart-interviews-contest",
            group: "tech",
            kind: "rank",
            metric: "16th",
            unit: "of 1450+",
            level: "Top 1%",
            position: 0.011,
            ahead: "Ahead of 98.9% of the field",
            title: "Smart Interviews coding contest",
            description: "Advanced data structures.",
        },
        {
            id: "unstop-bootcamp",
            group: "tech",
            kind: "rank",
            metric: "3.7%",
            unit: "of 6,500+",
            level: "Top 3.7%",
            position: 0.037,
            ahead: "Ahead of 96.3% of students",
            title: "Unstop Bootcamp selection",
            description: "Chosen from over 6,500 students.",
        },
        {
            id: "smart-coders",
            group: "tech",
            kind: "cert",
            icon: "🎓",
            title: "Smart Coders",
            description: "Smart Interviews · Certificate",
        },
        {
            id: "smart-india-hackathon",
            group: "tech",
            kind: "cert",
            icon: "💡",
            title: "Smart India Hackathon",
            description: "Participation certificate",
        },
        {
            id: "hockey",
            group: "non",
            kind: "medal",
            metal: "silver",
            metric: "2nd",
            chip: "National level",
            title: "Hockey",
            description: "Secured the second position at the national level in hockey.",
        },
        {
            id: "taekwondo",
            group: "non",
            kind: "medal",
            metal: "bronze",
            metric: "3rd",
            chip: "State level",
            title: "Taekwondo",
            description: "Secured the third position at the state level in taekwondo.",
        },
        {
            id: "scouts-guides",
            group: "non",
            kind: "badge",
            icon: "⚜️",
            title: "The Bharat Scouts & Guides",
            description: "Selected for Rashtrapati",
        },
        {
            id: "ncc",
            group: "non",
            kind: "badge",
            icon: "🎖️",
            title: "NCC",
            description: "‘A’ Certified Cadet",
        },
    ],
    status: "loaded",
    error: null,
    activeTab: "tech",
};

const achievementsSlice = createSlice({
    name: "achievements",
    initialState,
    reducers: {
        setAchievementsLoading(state) {
            state.status = "loading";
            state.error = null;
        },
        setAchievementsData(state, action) {
            state.data = action.payload;
            state.status = "loaded";
            state.error = null;
        },
        setAchievementsError(state, action) {
            state.status = "error";
            state.error = action.payload;
        },
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
    },
});

export const { setAchievementsLoading, setAchievementsData, setAchievementsError, setActiveTab } = achievementsSlice.actions;
export default achievementsSlice.reducer;