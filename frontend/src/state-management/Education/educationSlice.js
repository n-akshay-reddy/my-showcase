import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const educationSlice = createSlice({
    name: "education",
    initialState: { data: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.data = action.payload.education ?? [];
        });
    },
});

export default educationSlice.reducer;