import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const skillsSlice = createSlice({
    name: "skills",
    initialState: { data: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.data = action.payload.skills?.skills ?? [];
        });
    },
});

export default skillsSlice.reducer;