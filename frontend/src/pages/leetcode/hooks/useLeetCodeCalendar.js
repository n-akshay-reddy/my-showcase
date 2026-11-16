import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchLeetCodeCalendar } from "../leetcodeService";
import { mapLeetCodeCalendar } from "../leetcodeMapper";

import {setYearlyCalendarStatus,setYearlyCalendarData,setYearlyCalendarError,} from "../../../state-management/leetcode/leetcodeSlice";

export default function useLeetCodeCalendar() {
    const dispatch = useDispatch();

    const yearlyData = useSelector(
        (state) => state.leetcode.activity.yearlyData ?? {}
    );

    const fetchYear = useCallback(
        async (username, year) => {
            const normalizedUsername = username?.trim();
            if (!normalizedUsername || !Number.isInteger(year) || year < 2000 || year > new Date().getFullYear()) {
                return;
            }

            const cachedYear = yearlyData[normalizedUsername]?.[year];
            if (cachedYear?.status === "loaded" || cachedYear?.status === "loading") {
                return;
            }

            dispatch(setYearlyCalendarStatus({username: normalizedUsername,year,status: "loading"}));

            try {
                const response = await fetchLeetCodeCalendar(normalizedUsername,year);
                const mappedCalendar = mapLeetCodeCalendar(response);

                dispatch(
                    setYearlyCalendarData({
                        username: normalizedUsername,
                        year,
                        ...mappedCalendar,
                    })
                );
            } catch (error) {
                dispatch(
                    setYearlyCalendarError({
                        username: normalizedUsername,
                        year,
                        status: "error",
                        error: {
                            message:error instanceof Error? error.message: "Failed to fetch calendar.",
                            status: error.status ?? null,
                            data: error.data ?? null
                        },
                    })
                );
            }
        },
        [dispatch, yearlyData]
    );
    return { fetchYear };
}
