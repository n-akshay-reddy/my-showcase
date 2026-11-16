import "./LeetCodeError.css";

const getErrorInfo = (message = "") => {
    const status = Number(message.match(/\((\d{3})\)/)?.[1]);
    const isNetworkError = /^(failed to fetch|load failed)$/i.test(message.trim());

    if (status === 404) {
        return {
            before: "",
            after: "user not found",
            hint: "That LeetCode username doesn't exist. Try searching for another one.",
        };
    }

    if (status >= 500) {
        return {
            before: "Unable to load",
            after: "profile",
            hint: "The server ran into a problem while fetching this profile. Please try again in a moment.",
        };
    }

    if (isNetworkError) {
        return {
            before: "Unable to load",
            after: "profile",
            hint: "Couldn't reach the server. Check your internet connection and try again.",
        };
    }

    return {
        before: "Unable to load",
        after: "profile",
        hint: "Something went wrong while loading this profile.",
    };
};

function LeetCodeError({ message, onRetry, isRetrying = false }) {
    const { before, after, hint } = getErrorInfo(message);

    return (
        <div className="lc-error">
            <img
                className="lc-error__image"
                src="/error-images/confused-troubleshooting.png"
                alt="Confused character troubleshooting an error"
            />

            <div className="lc-error__content">
                <h2 className="lc-error__title">
                    {before} <span className="lc-error__gradient">LeetCode</span> {after}
                </h2>

                <p className="lc-error__subtitle">{hint}</p>

                <div className="lc-error__details" role="alert">
                    <svg className="lc-error__icon" viewBox="0 0 24 24" width="22" height="22" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="7" x2="12" y2="13" />
                        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                    </svg>

                    <div className="lc-error__text">
                        <div className="lc-error__label">Error Details</div>
                        <div className="lc-error__message">{message || "Unknown error"}</div>
                    </div>
                </div>

                <button className="lc-error__retry" onClick={onRetry} disabled={isRetrying}>
                    <span className={isRetrying ? "lc-error__spin" : ""}>↻</span>
                    {isRetrying ? "Retrying…" : "Try Again"}
                </button>
            </div>
        </div>
    );
}

export default LeetCodeError;