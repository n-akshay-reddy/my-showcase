import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const initialState = {
    // Same shape as about.json, but empty, so components never read undefined before the data arrives.
    data: {
        name: "",
        knownAs: "",
        headline: "",
        summary: "",
        roles: [],
        careerDirection: "",
        strengths: [],
        engineeringPrinciples: [],
        values: [],
        offTheClock: [],
        hobbies: [],
        passions: [],
    },
    activeTab: 0,
    selectedStrength: 0,
    activeValue: 0,
};

const moreSlice = createSlice({
    name: "more",
    initialState,
    reducers: {
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
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            // Merge over the empty defaults so a missing key in the backend can't become undefined.
            state.data = { ...initialState.data, ...(action.payload.about ?? {}) };
        });
    },
});

export const { setActiveTab, setSelectedStrength, setActiveValue } = moreSlice.actions;
export default moreSlice.reducer;