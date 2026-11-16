import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    UsersRound,
    UserRound,
    ArrowRight,
    LoaderCircle,
    X,
    CircleAlert,
} from "lucide-react";

import { setSearchError } from "../../../state-management/leetcode/leetcodeSlice";
import "./ViewOtherLeetCodeStats.css";

function getErrorMessage(error) {
    if (!error) return "";
    if (typeof error === "string") return error;

    return (
        error.data?.errors?.[0]?.message ||
        error.data?.message ||
        error.data?.error ||
        error.message ||
        ""
    );
}

function ViewOtherLeetCodeStats({ onSearch }) {
    const dispatch = useDispatch();

    const [username, setUsername] = useState("");
    const [inputError, setInputError] = useState("");

    const { status, searchError } = useSelector(
        (state) => state.leetcode
    );

    const isLoading = status === "loading";
    const serverError = getErrorMessage(searchError);

    const message = inputError || serverError;
    const isValidationError = Boolean(inputError);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isLoading) return;

        const trimmed = username.trim();

        if (trimmed.length < 2) {
            setInputError(
                trimmed
                    ? "Please enter a valid LeetCode username."
                    : "Please enter a LeetCode username."
            );
            return;
        }

        setInputError("");
        dispatch(setSearchError(null));

        await onSearch(trimmed);
    };

    const handleChange = (event) => {
        setUsername(event.target.value);

        // Clear validation errors while typing.
        setInputError("");

        // Clear the previous API/search error in Redux.
        dispatch(setSearchError(null));
    };

    const handleClear = () => {
        setUsername("");
        setInputError("");
        dispatch(setSearchError(null));
    };

    const handleDismiss = () => {
        if (inputError) {
            setInputError("");
        } else {
            dispatch(setSearchError(null));
        }
    };

    return (
        <section className="other-leetcode-card">
            <div className="other-leetcode-header">
                <UsersRound
                    className="other-leetcode-users"
                    size={42}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />

                <h3>View LeetCode Stats</h3>
            </div>

            <p className="other-leetcode-subtitle">
                Enter a LeetCode username to explore their stats
                and compare with mine.
            </p>

            <form
                className="other-leetcode-form"
                onSubmit={handleSubmit}
            >
                <div
                    className={`other-leetcode-input ${
                        message ? "error" : ""
                    }`}
                >
                    <UserRound
                        className="other-leetcode-person"
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <input
                        type="text"
                        value={username}
                        onChange={handleChange}
                        placeholder="e.g. n-akshay-reddy"
                        disabled={isLoading}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="LeetCode username"
                        aria-invalid={Boolean(message)}
                    />

                    {username && !isLoading && (
                        <button
                            type="button"
                            className="other-leetcode-clear"
                            onClick={handleClear}
                            aria-label="Clear username"
                            title="Clear username"
                        >
                            <X size={16} strokeWidth={2} />
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    className="other-leetcode-submit"
                    disabled={isLoading}
                    aria-label={
                        isLoading
                            ? "Loading profile"
                            : "Search profile"
                    }
                >
                    {isLoading ? (
                        <LoaderCircle
                            className="other-leetcode-spinner"
                            size={19}
                            strokeWidth={2.2}
                            aria-hidden="true"
                        />
                    ) : (
                        <ArrowRight
                            className="other-leetcode-arrow"
                            size={22}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    )}
                </button>
            </form>

            {message && (
                <div
                    className="other-leetcode-error"
                    role="alert"
                >
                    <span className="other-leetcode-error-symbol">
                        <CircleAlert
                            size={19}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    </span>

                    <div className="other-leetcode-error-body">
                        <strong>
                            {isValidationError
                                ? "Check the username"
                                : "Unable to load profile"}
                        </strong>

                        <p>{message}</p>
                    </div>

                    <button
                        type="button"
                        className="other-leetcode-error-close"
                        onClick={handleDismiss}
                        aria-label="Dismiss error"
                        title="Dismiss error"
                    >
                        <X size={16} strokeWidth={2.2} />
                    </button>
                </div>
            )}
        </section>
    );
}

export default ViewOtherLeetCodeStats;