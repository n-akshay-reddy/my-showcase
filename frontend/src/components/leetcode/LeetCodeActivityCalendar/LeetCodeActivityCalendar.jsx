// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";

// import { setSelectedYear } from "../../state-management/leetcode/leetcodeSlice";
// import useLeetCodeCalendar from "../../hooks/useLeetCodeCalendar";

// import "./LeetCodeActivityCalendar.css";

// const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// };

// // LeetCode calendar keys are Unix timestamps in seconds.
// // Use UTC to match the date represented by the API timestamp.
// const getSubmissionCount = (date, calendar) => {
//     const timestamp = Date.UTC(
//         date.getFullYear(),
//         date.getMonth(),
//         date.getDate()
//     ) / 1000;

//     return Number(calendar?.[timestamp] || 0);
// };

// const createMonths = (startDate, endDate) => {
//     const months = [];
//     let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

//     while (current <= endDate) {
//         const year = current.getFullYear();
//         const month = current.getMonth();

//         const monthStart = new Date(year, month, 1);
//         const monthEnd = new Date(year, month + 1, 0);

//         const visibleStart = monthStart < startDate ? startDate : monthStart;
//         const visibleEnd = monthEnd > endDate ? endDate : monthEnd;

//         months.push({ year, month, visibleStart, visibleEnd });

//         current = new Date(year, month + 1, 1);
//     }

//     return months;
// };

// const createMonthWeeks = (monthData) => {
//     const { year, month, visibleStart, visibleEnd } = monthData;
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     const weeks = [];
//     let currentWeek = [];

//     const firstWeekday = new Date(year, month, 1).getDay();

//     for (let i = 0; i < firstWeekday; i++) {
//         currentWeek.push(null);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(year, month, day);

//         if (date < visibleStart || date > visibleEnd) {
//             currentWeek.push(null);
//         } else {
//             currentWeek.push(date);
//         }

//         if (currentWeek.length === 7) {
//             weeks.push(currentWeek);
//             currentWeek = [];
//         }
//     }

//     if (currentWeek.length > 0) {
//         while (currentWeek.length < 7) {
//             currentWeek.push(null);
//         }

//         weeks.push(currentWeek);
//     }

//     return weeks;
// };

// const getMonthName = (year, month) => {
//     return new Date(year, month, 1).toLocaleString("en-US", {
//         month: "short"
//     });
// };

// const getActivityClass = (count) => {
//     if (count === 0) return "activity-0";
//     if (count === 1) return "activity-1";
//     if (count === 2) return "activity-2";
//     if (count === 3) return "activity-3";
//     if (count === 4) return "activity-4";

//     return "activity-5";
// };

// const LeetCodeActivityCalendar = () => {
//     const dispatch = useDispatch();
//     const { fetchYear } = useLeetCodeCalendar();

//     const selectedYear = useSelector(
//         state => state.leetcode.activity.selectedYear
//     );

//     const yearlyData = useSelector(
//         state => state.leetcode.activity.yearlyData
//     );

//     const activeYears = useSelector(
//         state => state.leetcode.activity.activeYears
//     );

//     const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

//     const currentYear = new Date().getFullYear();
//     const selectedYearData = yearlyData?.[selectedYear];

//     const calendar = selectedYearData?.calendar || {};

//     const isLoading =
//         !selectedYearData ||
//         selectedYearData.status === "loading";

//     const months = useMemo(() => {
//         const startDate = new Date(selectedYear, 0, 1);

//         // Current year: show only through today.
//         // Previous years: show the entire year.
//         const endDate = selectedYear === currentYear
//             ? new Date()
//             : new Date(selectedYear, 11, 31);

//         return createMonths(startDate, endDate);
//     }, [selectedYear, currentYear]);

//     const years = useMemo(() => {
//         return [...new Set([currentYear, ...(activeYears || [])])]
//             .sort((a, b) => b - a);
//     }, [activeYears, currentYear]);

//     useEffect(() => {
//         fetchYear(selectedYear);
//     }, [selectedYear, fetchYear]);

//     if (isLoading) {
//         return (
//             <div className="leetcode-shimmer-calendar">
//                 <div className="leetcode-shimmer-header">
//                     <div className="leetcode-shimmer-title"></div>
//                     <div className="leetcode-shimmer-stats">
//                         <div className="leetcode-shimmer-stat"></div>
//                         <div className="leetcode-shimmer-stat"></div>
//                     </div>
//                 </div>

//                 <div className="leetcode-shimmer-calendar-container">
//                     <div className="leetcode-shimmer-months">
//                         {Array.from({ length: 13 }).map((_, monthIndex) => (
//                             <div className="leetcode-shimmer-month" key={monthIndex}>
//                                 <div className="leetcode-shimmer-month-label"></div>
//                                 <div className="leetcode-shimmer-month-grid">
//                                     {Array.from({ length: 5 }).map((_, weekIndex) => (
//                                         <div className="leetcode-shimmer-week" key={weekIndex}>
//                                             {Array.from({ length: 7 }).map((_, dayIndex) => (
//                                                 <div
//                                                     className="leetcode-shimmer-day"
//                                                     key={dayIndex}
//                                                 />
//                                             ))}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (selectedYearData?.status === "error") {
//         return (
//             <div className="activity-calendar">
//                 <p>Unable to load calendar: {selectedYearData.error}</p>
//                 <button type="button" onClick={() => fetchYear(selectedYear)}>
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="activity-calendar">
//             <div className="activity-calendar-header">
//                 <div className="activity-title">
//                     {selectedYearData?.totalSubmissions || 0} submissions in {selectedYear}
//                 </div>

//                 <div className="activity-header-right">
//                     <div className="activity-stats">
//                         <span>
//                             Active days:
//                             <strong> {selectedYearData?.totalActiveDays || 0}</strong>
//                         </span>
//                     </div>

//                     {years.length > 1 && (
//                         <div className="activity-year-selector">
//                             <button
//                                 type="button"
//                                 className="activity-year-button"
//                                 onClick={() => setIsYearDropdownOpen(prev => !prev)}
//                             >
//                                 <span>
//                                     {selectedYear === currentYear ? "Current" : selectedYear}
//                                 </span>

//                                 <span
//                                     className={`activity-year-arrow ${
//                                         isYearDropdownOpen ? "open" : ""
//                                     }`}
//                                 >
//                                     ▼
//                                 </span>
//                             </button>

//                             {isYearDropdownOpen && (
//                                 <div className="activity-year-options">
//                                     {years.map(year => (
//                                         <button
//                                             type="button"
//                                             key={year}
//                                             className={`activity-year-option ${
//                                                 selectedYear === year ? "selected" : ""
//                                             }`}
//                                             onClick={() => {
//                                                 dispatch(setSelectedYear(year));
//                                                 setIsYearDropdownOpen(false);
//                                             }}
//                                         >
//                                             <span>
//                                                 {year === currentYear ? "Current" : year}
//                                             </span>

//                                             {selectedYear === year && <span>✓</span>}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div className="calendar-container">
//                 <div className="calendar-months">
//                     {months.map(monthData => {
//                         const { year, month } = monthData;
//                         const weeks = createMonthWeeks(monthData);

//                         return (
//                             <div
//                                 className="calendar-month"
//                                 key={`${year}-${month}`}
//                             >
//                                 <div className="month-label">
//                                     {getMonthName(year, month)}
//                                 </div>

//                                 <div className="month-grid">
//                                     {weeks.map((week, weekIndex) => (
//                                         <div className="calendar-week" key={weekIndex}>
//                                             {week.map((date, dayIndex) => {
//                                                 if (!date) {
//                                                     return (
//                                                         <div
//                                                             className="calendar-day empty"
//                                                             key={dayIndex}
//                                                         />
//                                                     );
//                                                 }

//                                                 const count = getSubmissionCount(
//                                                     date,
//                                                     calendar
//                                                 );

//                                                 return (
//                                                     <div
//                                                         className={`calendar-day ${getActivityClass(count)}`}
//                                                         key={formatDate(date)}
//                                                         title={`${formatDate(date)}: ${count} submissions`}
//                                                     />
//                                                 );
//                                             })}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LeetCodeActivityCalendar;

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setSelectedYear } from "../../../state-management/leetcode/leetcodeSlice";
import useLeetCodeCalendar from "../../../pages/leetcode/hooks/useLeetCodeCalendar";

import "./LeetCodeActivityCalendar.css";


// ======================================================
// SIZE SETTINGS
// ======================================================

// Keep DAY_GAP and MONTH_GAP equal to the gaps in the CSS file.

const MAX_CELL = 14;     // box size when there is plenty of room
const MIN_CELL = 11;     // below this we stop shrinking and scroll instead
const DAY_GAP = 4;       // gap between week columns inside a month
const MONTH_GAP = 14;    // gap between months

const SECONDS_PER_DAY = 86400;


// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// ======================================================
// NORMALIZE CALENDAR KEYS
// ======================================================

/*
 * LeetCode calendar keys are Unix timestamps in seconds.
 *
 * Newer data is keyed at UTC midnight, but older data (e.g. 2017) is keyed
 * at local Pacific midnight, which is 08:00 UTC. Flooring each key to its
 * UTC day makes both formats resolve to the same calendar date.
 * Counts that land on the same day are added together.
 */

const normalizeCalendar = (calendar) => {
    const result = {};

    Object.entries(calendar || {}).forEach(([timestamp, count]) => {
        const ts = Number(timestamp);

        if (!Number.isFinite(ts)) return;

        const day = Math.floor(ts / SECONDS_PER_DAY) * SECONDS_PER_DAY;

        result[day] = (result[day] ?? 0) + Number(count || 0);
    });

    return result;
};


// ======================================================
// GET SUBMISSION COUNT
// ======================================================

// Expects a calendar passed through normalizeCalendar (UTC-day keys).

const getSubmissionCount = (date, calendar) => {
    const timestamp =
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ) / 1000;

    return Number(calendar?.[timestamp] || 0);
};


// ======================================================
// CREATE MONTHS
// ======================================================

const createMonths = (startDate, endDate) => {
    const months = [];

    let current = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
    );

    while (current <= endDate) {
        const year = current.getFullYear();
        const month = current.getMonth();

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        const visibleStart =
            monthStart < startDate ? startDate : monthStart;

        const visibleEnd =
            monthEnd > endDate ? endDate : monthEnd;

        months.push({
            year,
            month,
            visibleStart,
            visibleEnd
        });

        current = new Date(year, month + 1, 1);
    }

    return months;
};


// ======================================================
// CREATE WEEKS FOR A MONTH
// ======================================================

const createMonthWeeks = (monthData) => {
    const {
        year,
        month,
        visibleStart,
        visibleEnd
    } = monthData;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let currentWeek = [];

    const firstWeekday = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstWeekday; i++) {
        currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        if (date < visibleStart || date > visibleEnd) {
            currentWeek.push(null);
        } else {
            currentWeek.push(date);
        }

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }

        weeks.push(currentWeek);
    }

    return weeks;
};


// ======================================================
// MONTH NAME
// ======================================================

const getMonthName = (year, month) => {
    return new Date(year, month, 1).toLocaleString("en-US", {
        month: "short"
    });
};


// ======================================================
// ACTIVITY CLASS
// ======================================================

const getActivityClass = (count) => {
    if (count === 0) return "activity-0";
    if (count === 1) return "activity-1";
    if (count === 2) return "activity-2";
    if (count === 3) return "activity-3";
    if (count === 4) return "activity-4";

    return "activity-5";
};


// ======================================================
// COMPONENT
// ======================================================

// ======================================================
// CALENDAR ERROR STATE
// ======================================================

// ======================================================
// CALENDAR ERROR STATE
// ======================================================

// Short, human-friendly text for each kind of error.
const getErrorInfo = ({ status, message, year, profileFailed }) => {
    const text = (message || "").toLowerCase();

    if (profileFailed) {
        return {
            accent: "#8b5cf6",
            title: "Profile didn't load",
            summary: "Reload the page and try again."
        };
    }

    if (status === 400 || status === 422 || text.includes("must be")) {
        return {
            accent: "#f59e0b",
            title: `${year} was rejected`,
            summary: "The server didn't accept this request. Try again or pick another year."
        };
    }

    if (status === 404) {
        return {
            accent: "#38bdf8",
            title: "No data found",
            summary: `Nothing available for ${year}. Pick another year.`
        };
    }

    if (status === 429) {
        return {
            accent: "#f59e0b",
            title: "Too many requests",
            summary: "Wait a minute, then try again."
        };
    }

    if (status >= 500) {
        return {
            accent: "#f43f5e",
            title: "Server hiccup",
            summary: "It's not you. Try again shortly."
        };
    }

    if (
        status == null &&
        (text.includes("network") || text.includes("fetch") || text.includes("timeout"))
    ) {
        return {
            accent: "#38bdf8",
            title: "Connection problem",
            summary: "Check your internet and try again."
        };
    }

    return {
        accent: "#f43f5e",
        title: "Couldn't load calendar",
        summary: "Something went wrong. Try again."
    };
};


const CalendarError = ({
    year,
    message,
    status,
    profileFailed,
    canRetry,
    onRetry,
    showCurrentButton,
    onGoCurrent
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [copied, setCopied] = useState(false);

    const info = getErrorInfo({ status, message, year, profileFailed });

    const detailsText = [
        `Year: ${year}`,
        status ? `Status: ${status}` : null,
        `Message: ${message || "Unknown error"}`
    ].filter(Boolean).join("\n");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(detailsText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
    };

    return (
        <div
            className={`cal-split ${imageFailed ? "no-image" : ""}`}
            role="alert"
            style={{ "--err": info.accent }}
        >

            {!imageFailed && (
                <div className="cal-split-media">
                    <img
                        className="cal-split-img"
                        src="/error-images/confused-troubleshooting.png"
                        alt=""
                        onError={() => setImageFailed(true)}
                    />
                </div>
            )}

            <div className="cal-split-body">

                {status ? (
                    <span className="cal-split-chip">Error {status}</span>
                ) : null}

                <h4 className="cal-split-title">{info.title}</h4>

                <p className="cal-split-text">{info.summary}</p>

                <div className="cal-split-actions">
                    <button
                        type="button"
                        className="cal-split-retry"
                        disabled={!canRetry}
                        onClick={onRetry}
                    >
                        Try again
                    </button>

                    {showCurrentButton && (
                        <button
                            type="button"
                            className="cal-split-ghost"
                            onClick={onGoCurrent}
                        >
                            Current year
                        </button>
                    )}

                    <button
                        type="button"
                        className="cal-split-link"
                        onClick={() => setShowDetails(prev => !prev)}
                        aria-expanded={showDetails}
                    >
                        {showDetails ? "Hide details" : "Show details"}
                        <svg
                            className={showDetails ? "open" : ""}
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M2.5 4.5L6 8L9.5 4.5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

            </div>

            {/* full width, below both halves */}
            {showDetails && (
                <div className="cal-split-details">
                    <pre>{detailsText}</pre>
                    <button type="button" onClick={handleCopy}>
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            )}

        </div>
    );
};

const LeetCodeActivityCalendar = () => {
    const dispatch = useDispatch();

    const { fetchYear } = useLeetCodeCalendar();


    // ==================================================
    // PROFILE STATUS + USERNAME
    // ==================================================

    // setLeetCodeData sets status to "loaded".
    const profileStatus = useSelector(
        state => state.leetcode.status
    );

    // yearlyData is stored as yearlyData[username][year],
    // so we need the username to read it.
    const username = useSelector(
        state => state.leetcode.username
    );


    // ==================================================
    // PROFILE CALENDAR (used for the current year)
    // ==================================================

    const profileCalendar = useSelector(
        state => state.leetcode.activity.calendar
    );

    const profileCalendarTotalSubmissions = useSelector(
        state => state.leetcode.activity.calendarTotalSubmissions
    );

    const profileCalendarTotalActiveDays = useSelector(
        state => state.leetcode.activity.calendarTotalActiveDays
    );

    const profileCalendarMaxStreak = useSelector(
        state => state.leetcode.activity.calendarMaxStreak
    );


    // ==================================================
    // SELECTED YEAR / YEARLY DATA / ACTIVE YEARS
    // ==================================================

    const selectedYear = useSelector(
        state => state.leetcode.activity.selectedYear
    );

    const yearlyData = useSelector(
        state => state.leetcode.activity.yearlyData
    );

    const activeYears = useSelector(
        state => state.leetcode.activity.activeYears
    );


    // ==================================================
    // DROPDOWN
    // ==================================================

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearSelectorRef = useRef(null);


    // ==================================================
    // CURRENT YEAR
    // ==================================================

    const currentYear = new Date().getFullYear();


    // ==================================================
    // FETCHED DATA FOR SELECTED YEAR
    // ==================================================

    const selectedYearData = yearlyData?.[username]?.[selectedYear];

    const isCurrentYear = selectedYear === currentYear;


    // ==================================================
    // CHOOSE WHERE CALENDAR DATA COMES FROM
    // ==================================================

    /*
     * CURRENT YEAR  -> profile API calendar
     * PREVIOUS YEAR -> yearlyData[username][selectedYear] (filled by fetchYear)
     */

    const rawCalendar =
        isCurrentYear
            ? profileCalendar
            : selectedYearData?.calendar;

    const calendar = useMemo(
        () => normalizeCalendar(rawCalendar),
        [rawCalendar]
    );

    const totalSubmissions =
        isCurrentYear
            ? profileCalendarTotalSubmissions || 0
            : selectedYearData?.totalSubmissions || 0;

    const totalActiveDays =
        isCurrentYear
            ? profileCalendarTotalActiveDays || 0
            : selectedYearData?.totalActiveDays || 0;

    // The slice stores the yearly value as `streak`.
    const calendarMaxStreak =
        isCurrentYear
            ? profileCalendarMaxStreak || 0
            : selectedYearData?.streak || 0;


    // ==================================================
    // CLOSE DROPDOWN ON OUTSIDE CLICK / ESCAPE
    // ==================================================

    useEffect(() => {
        if (!isYearDropdownOpen) return;

        const handlePointerDown = (event) => {
            if (
                yearSelectorRef.current &&
                !yearSelectorRef.current.contains(event.target)
            ) {
                setIsYearDropdownOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsYearDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isYearDropdownOpen]);


    // ==================================================
    // LOADING / ERROR FLAGS
    // ==================================================

    const isYearFetchPending =
        !isCurrentYear &&
        profileStatus !== "error" &&   // profile failed -> nothing will ever fetch, don't wait
        (
            !selectedYearData ||
            selectedYearData.status === "idle" ||
            selectedYearData.status === "loading"
        );

    const isLoading = profileStatus === "loading" || isYearFetchPending;

    const calendarErrorMessage = (() => {
        if (isCurrentYear) return null;

        if (selectedYearData?.status === "error") {
            return selectedYearData.error?.message ?? "Something went wrong.";
        }

        if (!selectedYearData && profileStatus === "error") {
            return "Unable to load profile, so the calendar can't be fetched.";
        }

        return null;
    })();

    const hasCalendarError = Boolean(calendarErrorMessage);


    // ==================================================
    // DATE RANGE
    // ==================================================

    const months = useMemo(() => {
        let startDate;
        let endDate;

        if (selectedYear === currentYear) {

            // Current year: same date last year -> today

            endDate = new Date();
            endDate.setHours(0, 0, 0, 0);

            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 1);

        } else {

            // Previous year: January 1 -> December 31

            startDate = new Date(selectedYear, 0, 1);
            endDate = new Date(selectedYear, 11, 31);
        }

        return createMonths(startDate, endDate);

    }, [selectedYear, currentYear]);


    // ==================================================
    // BUILD WEEKS ONCE (used for sizing and rendering)
    // ==================================================

    const monthsWithWeeks = useMemo(
        () => months.map(m => ({ ...m, weeks: createMonthWeeks(m) })),
        [months]
    );


    // ==================================================
    // AUTO CELL SIZE
    // ==================================================

    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(MAX_CELL);

    useEffect(() => {
        // The container is not rendered while loading or showing the error box.
        if (isLoading || hasCalendarError) return;

        const el = containerRef.current;
        if (!el) return;

        const compute = () => {
            const monthCount = monthsWithWeeks.length;

            const totalWeeks = monthsWithWeeks.reduce(
                (sum, m) => sum + m.weeks.length,
                0
            );

            const gaps =
                (totalWeeks - monthCount) * DAY_GAP +
                (monthCount - 1) * MONTH_GAP;

            const size = Math.floor(
                (el.clientWidth - gaps) / totalWeeks
            );

            setCellSize(
                Math.max(MIN_CELL, Math.min(MAX_CELL, size))
            );
        };

        compute();

        const observer = new ResizeObserver(compute);
        observer.observe(el);

        return () => observer.disconnect();

    }, [monthsWithWeeks, isLoading, hasCalendarError]);


    // On small screens start scrolled to the latest months
    useEffect(() => {
        const el = containerRef.current;

        if (el && !isLoading && !hasCalendarError) {
            el.scrollLeft = el.scrollWidth;
        }
    }, [isLoading, hasCalendarError, selectedYear]);


    // ==================================================
    // YEAR OPTIONS
    // ==================================================

    const years = useMemo(() => {
        return [
            ...new Set([
                currentYear,
                ...(activeYears || [])
            ])
        ].sort((a, b) => b - a);

    }, [activeYears, currentYear]);


    // ==================================================
    // FETCH YEAR WHEN USER CHANGES YEAR
    // ==================================================

    const previousSelectionRef = useRef(null);

useEffect(() => {
    // Wait until the profile and username are available.
    if (profileStatus !== "loaded" || !username) {
        return;
    }

    // Current year uses the profile API.
    if (selectedYear === currentYear) {
        previousSelectionRef.current = selectedYear;
        return;
    }

    // Prevent the same selection from triggering another request
    // when Redux updates after loading or an error.
    if (previousSelectionRef.current === selectedYear) {
        return;
    }

    // Record this selection before starting the request.
    previousSelectionRef.current = selectedYear;

    const status = yearlyData?.[username]?.[selectedYear]?.status;

    // Reuse successful data and avoid duplicate in-flight requests.
    // An error is deliberately NOT skipped.
    if (status === "loaded" || status === "loading") {
        return;
    }

    fetchYear(username, selectedYear);
}, [
    selectedYear,
    currentYear,
    profileStatus,
    username,
    yearlyData,
    fetchYear,
]);


    // ==================================================
    // LOADING UI
    // ==================================================

    if (isLoading) {
        return (
            <div className="leetcode-shimmer-calendar">

                <div className="leetcode-shimmer-header">

                    <div className="leetcode-shimmer-title"></div>

                    <div className="leetcode-shimmer-stats">
                        <div className="leetcode-shimmer-stat"></div>
                        <div className="leetcode-shimmer-stat"></div>
                    </div>

                </div>


                <div className="leetcode-shimmer-calendar-container">

                    <div className="leetcode-shimmer-months">

                        {Array.from({ length: 13 }).map((_, monthIndex) => (

                            <div
                                className="leetcode-shimmer-month"
                                key={monthIndex}
                            >

                                <div className="leetcode-shimmer-month-label"></div>

                                <div className="leetcode-shimmer-month-grid">

                                    {Array.from({ length: 5 }).map((_, weekIndex) => (

                                        <div
                                            className="leetcode-shimmer-week"
                                            key={weekIndex}
                                        >

                                            {Array.from({ length: 7 }).map((_, dayIndex) => (

                                                <div
                                                    className="leetcode-shimmer-day"
                                                    key={dayIndex}
                                                />

                                            ))}

                                        </div>

                                    ))}

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>
        );
    }


    // ==================================================
    // RENDER
    // (no early return for errors: the header and year
    //  dropdown stay, only the calendar area shows the error)
    // ==================================================

    return (
        <div className="activity-calendar">

            <div className="activity-calendar-header">

                <div className="activity-title">
                    {hasCalendarError
                        ? `Submissions in ${selectedYear}`
                        : <>{totalSubmissions} submissions in {selectedYear}</>}
                </div>


                <div className="activity-header-right">

                    {!hasCalendarError && (
                        <div className="activity-stats">
                            <span>
                                Active days:
                                <strong>
                                    {" "}
                                    {totalActiveDays}
                                </strong>
                            </span>

                            <span>
                                Max Streaks:
                                <strong>
                                    {" "}
                                    {calendarMaxStreak}
                                </strong>
                            </span>
                        </div>
                    )}


                    {years.length > 1 && (

                        <div className="activity-year-selector" ref={yearSelectorRef}>

                            <button
                                type="button"
                                className="activity-year-button"
                                onClick={() =>
                                    setIsYearDropdownOpen(prev => !prev)
                                }
                            >

                                <span>
                                    {selectedYear === currentYear
                                        ? "Current"
                                        : selectedYear}
                                </span>

                                <svg
                                    className={`activity-year-arrow ${isYearDropdownOpen ? "open" : ""}`}
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M2.5 4.5L6 8L9.5 4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                            </button>


                            {isYearDropdownOpen && (

                                <div className="activity-year-options">

                                    {years.map(year => (

                                        <button
                                            type="button"
                                            key={year}
                                            className={`activity-year-option ${selectedYear === year ? "selected" : ""}`}
                                            onClick={() => {
                                                dispatch(setSelectedYear(year));
                                                setIsYearDropdownOpen(false);
                                            }}
                                        >

                                            <span>
                                                {year === currentYear
                                                    ? "Current"
                                                    : year}
                                            </span>

                                            {selectedYear === year && (
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M2.5 6.5L5 9L9.5 3.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}

                                        </button>

                                    ))}

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* ========================================
                CALENDAR / ERROR BOX
            ======================================== */}

            {hasCalendarError ? (

                <CalendarError
        year={selectedYear}
        message={calendarErrorMessage}
        status={selectedYearData?.error?.status ?? null}
        profileFailed={!selectedYearData && profileStatus === "error"}
        canRetry={Boolean(username)}
        onRetry={() => fetchYear(username, selectedYear, { force: true })}
        showCurrentButton={!isCurrentYear}
        onGoCurrent={() => dispatch(setSelectedYear(currentYear))}
    />

            ) : (

                <div
                    className="calendar-container"
                    ref={containerRef}
                    style={{ "--cell": `${cellSize}px` }}
                >

                    <div className="calendar-months">

                        {monthsWithWeeks.map(monthData => {

                            const { year, month, weeks } = monthData;

                            return (
                                <div
                                    className="calendar-month"
                                    key={`${year}-${month}`}
                                >

                                    <div className="month-label">
                                        {getMonthName(year, month)}
                                    </div>


                                    <div className="month-grid">

                                        {weeks.map((week, weekIndex) => (

                                            <div
                                                className="calendar-week"
                                                key={weekIndex}
                                            >

                                                {week.map((date, dayIndex) => {

                                                    if (!date) {
                                                        return (
                                                            <div
                                                                className="calendar-day empty"
                                                                key={dayIndex}
                                                            />
                                                        );
                                                    }

                                                    const count =
                                                        getSubmissionCount(
                                                            date,
                                                            calendar
                                                        );

                                                    return (
                                                        <div
                                                            className={`calendar-day ${getActivityClass(count)}`}
                                                            key={formatDate(date)}
                                                            title={`${formatDate(date)}: ${count} submissions`}
                                                        />
                                                    );

                                                })}

                                            </div>

                                        ))}

                                    </div>

                                </div>
                            );

                        })}

                    </div>

                </div>

            )}

        </div>
    );
};


export default LeetCodeActivityCalendar;