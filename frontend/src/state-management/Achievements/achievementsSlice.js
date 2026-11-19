import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const initialState = {
    data: [],
    activeTab: "tech",
};

const achievementsSlice = createSlice({
    name: "achievements",
    initialState,
    reducers: {
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.data = action.payload.about?.achievements ?? [];
        });
    },
});

export const { setActiveTab } = achievementsSlice.actions;
export default achievementsSlice.reducer;