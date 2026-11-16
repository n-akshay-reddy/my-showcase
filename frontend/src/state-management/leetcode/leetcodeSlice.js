import { createSlice } from "@reduxjs/toolkit";

const createDifficultyStats = ({ withBeats = true } = {}) => ({
    problemsSolved: 0,
    totalQuestions: 0,

    totalAcceptedSubmissions: 0,
    numberOfProblemsAttempted: 0,
    totalSubmissions: 0,

    ...(withBeats && { beats: 0 }),
    acceptanceRate: 0
});

const initialState = {
    status: "idle",
    username: null,
    realName: null,
    avatar: null,
    error: null,
    searchError: null,


    difficulty: {
        all: createDifficultyStats({ withBeats: false }),
        easy: createDifficultyStats(),
        medium: createDifficultyStats(),
        hard: createDifficultyStats()
    },

    skills: {
        advanced: [],
        intermediate: [],
        fundamental: []
    },


    rank: {
        globalRanking: 0,
    },

    activity: {
        calendar: {},

        calendarTotalSubmissions: 0,
        calendarTotalActiveDays: 0,

        totalActiveDays: 0,
        highestProblemsInOneDay: 0,
        calendarMaxStreak: 0,
        longestStreak: 0,
        currentStreak: 0,
        selectedYear: new Date().getFullYear(),
        yearlyData: {},
        activeYears: []
    }
};

const leetcodeSlice = createSlice({
    name: "leetcode",
    initialState,

    reducers: {

        setSelectedYear: (state, action) => {
            state.activity.selectedYear = action.payload;
        },

        setLeetCodeData: (state, action) => {
            const currentYear = new Date().getFullYear();
            const {username,activity = {}} = action.payload;
            const existingYearlyData = state.activity.yearlyData ?? {};
            return {
                ...state,
                ...action.payload,
                status: "loaded",
                error: null,
                searchError:null,
                activity: {
                    ...state.activity,
                    ...activity,
                    selectedYear: currentYear,
                    yearlyData: {
                         ...existingYearlyData,
                        [username]: {
                            ...(existingYearlyData[username] ?? {}),
                            [currentYear]: {
                                calendar: activity?.calendar ?? {},
                                totalSubmissions: activity?.calendarTotalSubmissions ?? 0,
                                totalActiveDays:activity?.calendarTotalActiveDays ?? 0,
                                streak: activity?.calendarMaxStreak ?? 0,
                                activeYears: activity?.activeYears ?? [],
                                status: "loaded",
                                error: null,
                            }   
                        }
                    }
                }
            }
        },

        // ============================================
        // PROFILE STATUS
        // ============================================
        setLeetCodeStatus: (state, action) => {
            state.status = action.payload;
            state.error = null;
        },

        // ============================================
        // PROFILE ERROR
        // ============================================
        setLeetCodeError: (state, action) => {
            const { error, status } = action.payload;
            state.status = status ?? "error";
            state.error = error;
        },

        // ============================================
        // CLEAR
        // ============================================
        clearLeetCodeData: () => {
            return initialState;
        },


        // ============================================
        // YEARLY CALENDAR STATUS
        // ============================================
        setYearlyCalendarStatus: (state,action) => {
            const {username,year,status} = action.payload;

            if (!state.activity.yearlyData[username]) {
                state.activity.yearlyData[username] = {};
            }

            if (!state.activity.yearlyData[username][year]) {
                state.activity.yearlyData[username][year] = {
                    calendar: {},
                    totalSubmissions: 0,
                    totalActiveDays: 0,
                    status: "idle",
                    streak: 0,
                    activeYears: [],
                    error: null
                };
            }

            state.activity.yearlyData[username][year].status = status;
            if (status === "loading") {
                state.activity.yearlyData[username][year].error = null;
            }
        },

        // ============================================
        // YEARLY CALENDAR DATA
        // ============================================
        setYearlyCalendarData: (state,action) => {
            const {username,year,calendar,totalSubmissions,totalActiveDays,streak,activeYears} = action.payload;
            if (!state.activity.yearlyData[username]) {
                state.activity.yearlyData[username] = {};
            }

            state.activity.yearlyData[username][year] = {
                calendar,
                totalSubmissions,
                totalActiveDays,
                streak,
                activeYears,
                status: "loaded",
                error: null
            };
        },

        // ============================================
        // YEARLY CALENDAR ERROR
        // ============================================
        setYearlyCalendarError: (state, action) => {
            const {username,year,error,status} = action.payload;

            if (!state.activity.yearlyData[username]) {
                state.activity.yearlyData[username] = {};
            }

            if (!state.activity.yearlyData[username][year]) {
                state.activity.yearlyData[username][year] = {
                    calendar: {},
                    totalSubmissions: 0,
                    totalActiveDays: 0,
                    status: "idle",
                    streak: 0,
                    activeYears: [],
                    error: null
                };
            }
            state.activity.yearlyData[username][year].status = status ?? "error"
            state.activity.yearlyData[username][year].error = error;
        },

        setSearchError: (state,action) => {
            state.searchError = action.payload;
            state.status = "loaded";
        }
    }
});

export const {setLeetCodeData,setLeetCodeStatus,clearLeetCodeData,setLeetCodeError,setSelectedYear,
    setYearlyCalendarStatus,setYearlyCalendarData,setYearlyCalendarError,setSearchError} = leetcodeSlice.actions;

export default leetcodeSlice.reducer;