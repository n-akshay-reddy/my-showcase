import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile } from "../profile/profileThunk";

const initialState = {
    data: {
        projects: [],
        moreProjects: [],
    },
    openProjectId: null,
};

const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        toggleProject(state, action) {
            state.openProjectId = state.openProjectId === action.payload ? null : action.payload;
        },
        closeProject(state) {
            state.openProjectId = null;
        },
        openNextProject(state) {
            const list = state.data.projects;
            const total = list.length;
            if (!total) return;
            const current = list.findIndex((project) => project.id === state.openProjectId);
            state.openProjectId = list[(current + 1) % total].id;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            const { projects = [], moreProjects = [] } = action.payload.projects ?? {};
            state.data = { projects, moreProjects };
            if (!projects.some((project) => project.id === state.openProjectId)) {
                state.openProjectId = null;
            }
        });
    },
});

export const { toggleProject, closeProject, openNextProject } = projectsSlice.actions;
export default projectsSlice.reducer;