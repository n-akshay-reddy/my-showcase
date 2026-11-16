import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: "idle", // "idle" | "loading" | "loaded" | "error"
    companies: [],
    error: null,
    openCompanyId: null,
};

const experienceSlice = createSlice({
    name: "experience",
    initialState,

    reducers: {
        setExperienceStatus: (state, action) => {
            state.status = action.payload;
            state.error = null;
        },

        setExperienceData: (state, action) => {
            state.companies = action.payload;
            state.status = "loaded";
            state.error = null;
        },

        setExperienceError: (state, action) => {
            state.status = "error";
            state.error = action.payload;
        },

        openCompany: (state, action) => {
            state.openCompanyId = action.payload;
        },

        closeCompany: (state) => {
            state.openCompanyId = null;
        },
    },
});

export const { setExperienceStatus, setExperienceData, setExperienceError, openCompany, closeCompany } = experienceSlice.actions;

export default experienceSlice.reducer;