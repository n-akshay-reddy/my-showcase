import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { getLeetCodeProfile } from "../leetcodeService";
import {mapLeetCodeProfile} from "../leetcodeMapper";

import {setLeetCodeData,setLeetCodeStatus,setLeetCodeError,setSearchError} from "../../../state-management/leetcode/leetcodeSlice";

function useLeetCodeProfile() {
    const dispatch = useDispatch();
    const fetchProfile = useCallback(
        async (username,isSearch = false) => {
            dispatch(setLeetCodeStatus("loading"));
            try {
                const response = await getLeetCodeProfile(username);
                const mappedData = mapLeetCodeProfile(response);
                dispatch(setLeetCodeData(mappedData));
            } catch (error) {

                const normalizedError = {
                    message:error instanceof Error? error.message: "Failed to fetch LeetCode profile.",
                    status: error?.status ?? null,
                    data: error?.data ?? null
                };
                if (isSearch) {
                    dispatch(setSearchError(normalizedError));
                } else {
                    dispatch(
                        setLeetCodeError({error: normalizedError})
                    );
                }
            }
        },
        [dispatch]
    );
    return {fetchProfile};
}

export default useLeetCodeProfile;
