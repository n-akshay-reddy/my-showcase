import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import "./LeetCodeProfile.css";

function timeAgo(date) {
    if (!date) return "Not synced yet";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return "Updated just now";
    if (seconds < 60) return `Updated ${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Updated ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Updated ${hours}h ago`;

    return `Updated ${Math.floor(hours / 24)}d ago`;
}

/* Small stroked icon helper (all icons share the same attributes) */
const Icon = ({ children, ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
);

function LeetCodeProfile({
    username,
    isOwnProfile,
    isSyncing,
    lastUpdated,
    onRefresh,
    onBackToMine
}) {
    const { avatar, realName, rank, difficulty, activity, profile } =
        useSelector((state) => state.leetcode);

    const displayAvatar = avatar || profile?.avatar || "";
    const displayName = realName || profile?.realName || username;

    /* field names as stored in leetcodeSlice */
    const globalRank = rank?.globalRanking || 0;
    const solved = difficulty?.all?.problemsSolved || 0;
    const streak = activity?.currentStreak || 0;
    const bestStreak = Math.max(
        activity?.longestStreak || 0,
        activity?.calendarMaxStreak || 0
    );

    /* re-render every 30s so "x min ago" stays accurate */
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(id);
    }, []);

    const profileUrl = `https://leetcode.com/u/${encodeURIComponent(username)}/`;
    const initial = username?.charAt(0)?.toUpperCase() || "?";

    const classes = [
        "lcp",
        isOwnProfile ? "own" : "other",
        isSyncing && "syncing"
    ].filter(Boolean).join(" ");

    return (
        <section className={classes}>
            {/* Avatar */}
            <div className="lcp-avatar-wrap">
                <div className="lcp-halo" />

                <div className="lcp-ring">
                    {displayAvatar ? (
                        <img className="lcp-avatar" src={displayAvatar} alt={displayName} />
                    ) : (
                        <div className="lcp-avatar lcp-fallback">{initial}</div>
                    )}
                </div>

                <span className="lcp-online" />
            </div>

            {/* Info */}
            <div className="lcp-info">
                <div className="lcp-topline">
                    <span className="lcp-eyebrow">
                        <span className="lcp-eyebrow-dot" />
                        {isSyncing
                            ? "Syncing…"
                            : isOwnProfile
                                ? "My LeetCode Profile"
                                : "Viewing Profile"}
                    </span>

                    {!isOwnProfile && (
                        <button
                            type="button"
                            className="lcp-back-chip"
                            onClick={onBackToMine}
                            disabled={isSyncing}
                        >
                            <Icon strokeWidth="2.6">
                                <path d="M19 12H5" />
                                <path d="m12 19-7-7 7-7" />
                            </Icon>
                            Back to my profile
                        </button>
                    )}
                </div>

                <h2 className="lcp-name">{displayName}</h2>

                {username && (
                    <a
                        className="lcp-handle"
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open LeetCode profile"
                        aria-label={`Open ${username} on LeetCode`}
                    >
                        <span className="lcp-handle-text">{username}</span>
                        <span className="lcp-open">
                            <Icon strokeWidth="2.4">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <path d="M15 3h6v6" />
                                <path d="M10 14 21 3" />
                            </Icon>
                        </span>
                    </a>
                )}

                {/* Only render a stat when it has a meaningful value */}
                {(globalRank > 0 || solved > 0 || streak > 0 || bestStreak > 0) && (
                    <div className="lcp-stats">
                        {globalRank > 0 && (
                            <div className="lcp-stat lcp-stat--rank">
                                <span className="lcp-stat-icon">
                                    <Icon>
                                        <circle cx="12" cy="8" r="6" />
                                        <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
                                    </Icon>
                                </span>
                                <div>
                                    <span>Global Rank</span>
                                    <strong>{globalRank.toLocaleString()}</strong>
                                </div>
                            </div>
                        )}

                        {solved > 0 && (
                            <div className="lcp-stat lcp-stat--solved">
                                <span className="lcp-stat-icon">
                                    <Icon>
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                                    </Icon>
                                </span>
                                <div>
                                    <span>Solved</span>
                                    <strong>{solved.toLocaleString()}</strong>
                                </div>
                            </div>
                        )}

                        {streak > 0 && (
                            <div className="lcp-stat lcp-stat--streak">
                                <span className="lcp-stat-icon">
                                    <Icon>
                                        <path d="M12 2c.8 3.6-3 5-3 9a5 5 0 0 0 10 0c0-2-.9-3.4-2-4.5 0 2-.9 3-2 3 .9-2.8.3-5.4-3-7.5z" />
                                    </Icon>
                                </span>
                                <div>
                                    <span>Streak</span>
                                    <strong>{streak} <small>days</small></strong>
                                </div>
                            </div>
                        )}

                        {bestStreak > 0 && (
                            <div className="lcp-stat lcp-stat--best">
                                <span className="lcp-stat-icon">
                                    <Icon>
                                        <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
                                    </Icon>
                                </span>
                                <div>
                                    <span>Best Streak</span>
                                    <strong>{bestStreak} <small>days</small></strong>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="lcp-actions">
                    <button
                        type="button"
                        className="lcp-btn"
                        onClick={onRefresh}
                        disabled={isSyncing}
                    >
                        <Icon className={isSyncing ? "spinning" : ""} strokeWidth="2.4">
                            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                            <path d="M21 3v6h-6" />
                        </Icon>
                        {isSyncing ? "Fetching…" : "Refresh data"}
                    </button>

                    <span className="lcp-updated">{timeAgo(lastUpdated)}</span>
                </div>
            </div>
        </section>
    );
}

export default LeetCodeProfile;