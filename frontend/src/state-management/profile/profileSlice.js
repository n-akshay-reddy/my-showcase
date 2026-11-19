import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "./profileThunk";

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        status: "idle", 
        error: null,    // { message, status, data } 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state) => {
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? {
                    message: action.error.message || "Failed to load profile data.",
                    status: null,
                    data: null,
                };
            });
    },
});

export default profileSlice.reducer;