import { useEffect, useState } from "react";
import { useSelector, useStore } from "react-redux";

import LeetCodeActivityCalendar from "../../components/leetcode/LeetCodeActivityCalendar/LeetCodeActivityCalendar";
import ProblemStats from "../../components/leetcode/ProblemStats/ProblemStats";
import TopSkills from "../../components/leetcode/TopSkills/TopSkills";
import ViewOtherLeetCodeStats from "../../components/leetcode/ViewOtherLeetCodeStats/ViewOtherLeetCodeStats";
import LeetCodeProfile from "../../components/leetcode/LeetCodeProfile/LeetCodeProfile";
import LeetCodeError from "../../components/leetcode/LeetCodeError/LeetCodeError";

import useLeetCodeProfile from "./hooks/useLeetCodeProfile";

import "./LeetCode.css";

const DEFAULT_USERNAME =
    import.meta.env.VITE_LEETCODE_USERNAME || "n-akshay-reddy";

function LeetCode() {
    const store = useStore();
    const { fetchProfile } = useLeetCodeProfile();

    const { status, error, username: loadedUsername } = useSelector(
        (state) => state.leetcode
    );

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    /*
     * The profile on screen is always the last one that loaded successfully
     * (it comes from Redux), so a failed search never changes what is shown.
     */
    const hasData = Boolean(loadedUsername);
    const shownUsername = loadedUsername || DEFAULT_USERNAME;
    const isOwnProfile =
        shownUsername.toLowerCase() === DEFAULT_USERNAME.toLowerCase();

    const syncProfile = async (name,isSearch=false) => {
        setIsSyncing(true);

        try {
            await fetchProfile(name,isSearch);
        } finally {
            setIsSyncing(false);

            // only stamp "updated" when this request really succeeded
            if (!store.getState().leetcode.error) {
                setLastUpdated(new Date());
            }
        }
    };

    // Load my profile once
    useEffect(() => {
        syncProfile(DEFAULT_USERNAME);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProfile]);

    const handleSearch = async (name) => {
        const trimmed = name.trim();
        if (trimmed) await syncProfile(trimmed,true);
    };

    const handleRefresh = () => syncProfile(shownUsername);
    const handleBackToMine = () => syncProfile(DEFAULT_USERNAME);

    /*
     * Full-page error ONLY when there is nothing to show (e.g. my own
     * profile failed on first load). A failed search keeps the current
     * data on screen and the message appears inside the search card.
     */
    if (status === "error" && !hasData) {
        return (
            <div className="leetcode-page">
                <LeetCodeError
                    message={
                        typeof error === "string" ? error : error?.message
                    }
                    onRetry={() => syncProfile(DEFAULT_USERNAME)}
                    isRetrying={isSyncing}
                />
            </div>
        );
    }

    return (
        <div className="leetcode-page">
        
            <div className="leetcode-layout">
                <div className="leetcode-slot-profile">
                    <LeetCodeProfile
                        username={shownUsername}
                        isOwnProfile={isOwnProfile}
                        isSyncing={isSyncing}
                        lastUpdated={lastUpdated}
                        onRefresh={handleRefresh}
                        onBackToMine={handleBackToMine}
                    />
                </div>

                <div className="leetcode-slot-search">
                    <ViewOtherLeetCodeStats onSearch={handleSearch} />
                </div>

                <div className="leetcode-slot-main">
                    <ProblemStats />
                    <LeetCodeActivityCalendar />
                </div>

                {/* Skills: sized by the left column, scrolls inside. The
                    positioning is inline so it works even if the CSS file
                    still has old rules. */}
                <div
                    className="leetcode-slot-skills"
                    style={{ position: "relative", minHeight: 420 }}
                >
                    <div
                        className="leetcode-skills-fill"
                        style={{ position: "absolute", inset: 0 }}
                    >
                        <TopSkills />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeetCode;