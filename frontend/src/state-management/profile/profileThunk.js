import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProfile } from "../../util/profileService";

export const fetchProfile = createAsyncThunk("profile/fetch", async (_, { rejectWithValue }) => {
    try {
        const response = await getProfile();
        return response.data;
    } catch (error) {
        return rejectWithValue({
            message: error.message || "Failed to load profile data.",
            status: error.status ?? null, 
            data: error.data ?? null,     
        });
    }
});