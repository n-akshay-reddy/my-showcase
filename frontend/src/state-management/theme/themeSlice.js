import { createSlice} from "@reduxjs/toolkit";

const initialState= {
    mode: "dark-mode",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state,action) => {
            state.mode = action.payload;
        },

        toggleTheme: (state) => {
            state.mode =state.mode === "dark-mode"? "light-mode": "dark-mode";
        },
    },
});

export const {setTheme,toggleTheme} = themeSlice.actions;

export default themeSlice.reducer;