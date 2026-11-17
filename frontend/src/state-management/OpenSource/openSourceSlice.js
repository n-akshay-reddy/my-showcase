import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: [
        {
            id: "oss-apex-xlsx",
            name: "Lightweight XLSX Utility for Apex",
            status: "Merged",
            pullRequestTitle: "Add toSheetMap() API for sheet-name based, row-major XLSX parsing",
            pullRequestNumber: 7,
            problem: "Reading XLSX data meant dealing with complex low-level structures, which made it hard to use in everyday Apex code.",
            contribution: "Built Parse.toSheetMap(): each worksheet comes back by name as simple rows and columns.",
            impact: "Spreadsheet data is now easy to use in Apex. The maintainer found it clear and well documented, and merged it.",
            pullRequestUrl: "https://github.com/jfwberg/lightweight-xlsx-util/pull/7",
            repositoryUrl: "https://github.com/jfwberg/lightweight-xlsx-util",
            mergeCommitUrl: "https://github.com/jfwberg/lightweight-xlsx-util/commit/45dbcbda2d3bd764e0efb5060a90e2b0ff9ad0a5",
        },
    ],
    status: "loaded",
    error: null,
    activeId: "oss-apex-xlsx",
};

const openSourceSlice = createSlice({
    name: "openSource",
    initialState,
    reducers: {
        setOpenSourceLoading(state) {
            state.status = "loading";
            state.error = null;
        },
        setOpenSourceData(state, action) {
            state.data = action.payload;
            state.status = "loaded";
            state.error = null;
        },
        setOpenSourceError(state, action) {
            state.status = "error";
            state.error = action.payload;
        },
        setActiveId(state, action) {
            state.activeId = action.payload;
        },
    },
});

export const { setOpenSourceLoading, setOpenSourceData, setOpenSourceError, setActiveId } = openSourceSlice.actions;
export default openSourceSlice.reducer;