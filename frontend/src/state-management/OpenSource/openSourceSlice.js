import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const initialState = {
    data: [],
    activeId: null,
};

const openSourceSlice = createSlice({
    name: "openSource",
    initialState,
    reducers: {
        setActiveId(state, action) {
            state.activeId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            const raw = action.payload.openSource;
            // Backend sends one object today; this also works if it becomes an array later.
            const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

            state.data = list;
            if (!list.some((item) => item.id === state.activeId)) {
                state.activeId = list[0]?.id ?? null;
            }
        });
    },
});

export const { setActiveId } = openSourceSlice.actions;
export default openSourceSlice.reducer;