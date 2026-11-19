import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const initialState = {
    companies: [],
    openCompanyId: null,
};

const experienceSlice = createSlice({
    name: "experience",
    initialState,

    reducers: {
        openCompany: (state, action) => {
            state.openCompanyId = action.payload;
        },

        closeCompany: (state) => {
            state.openCompanyId = null;
        },
    },

    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            const companies = action.payload.experience ?? [];
            state.companies = companies;

            // Close the window if the open company is no longer in the list.
            if (!companies.some((company) => company.id === state.openCompanyId)) {
                state.openCompanyId = null;
            }
        });
    },
});

export const { openCompany, closeCompany } = experienceSlice.actions;

export default experienceSlice.reducer;