const getDifficultyStats = (stats, difficulty) => {
    if (!Array.isArray(stats)) {
        return {};
    }

    return (
        stats.find(
            (item) => item?.difficulty === difficulty
        ) ?? {}
    );
};

const parseSubmissionCalendar = (calendar) => {
    if (!calendar) return {};
    const parsedCalendar = typeof calendar === "string" ? JSON.parse(calendar) : calendar;
    if (typeof parsedCalendar !== "object" || parsedCalendar === null || Array.isArray(parsedCalendar)) {
        throw new Error("Invalid submission calendar format.");
    }
    return parsedCalendar;
};

const calculateAcceptanceRate = (acceptedSubmissions, totalSubmissions) => {
    const accepted = Number(acceptedSubmissions);
    const total = Number(totalSubmissions);
    if (!Number.isFinite(accepted) || !Number.isFinite(total) || accepted < 0 || total <= 0) {
        return 0;
    }
    return Number(((accepted / total) * 100).toFixed(2));
};



export const mapLeetCodeProfile = (response) => {
    const user = response?.matchedUser;
    if (!user || typeof user !== "object") {
        throw new Error("LeetCode profile data not found.");
    }

    const profile = user?.profile ?? {};

    // ============================================
    // DIFFICULTY STATS
    // ============================================
    const allQuestionsCount = response?.allQuestionsCount ?? [];
    const acSubmissionStats = user?.submitStatsGlobal?.acSubmissionNum ?? [];
    const totalSubmissionStats = user?.submitStatsGlobal?.totalSubmissionNum ?? [];
    const beatsStats = user?.problemsSolvedBeatsStats ?? [];

    const all = {
        problemsSolved: getDifficultyStats(acSubmissionStats, "All").count ?? 0,
        totalQuestions: getDifficultyStats(allQuestionsCount, "All").count ?? 0,
        totalSubmissions: getDifficultyStats(totalSubmissionStats, "All").submissions ?? 0,
        totalAcceptedSubmissions: getDifficultyStats(acSubmissionStats, "All").submissions ?? 0,
        numberOfProblemsAttempted: getDifficultyStats(totalSubmissionStats, "All").count ?? 0,
    };

    const easy = {
        problemsSolved: getDifficultyStats(acSubmissionStats, "Easy").count ?? 0,
        totalQuestions: getDifficultyStats(allQuestionsCount, "Easy").count ?? 0,
        totalSubmissions: getDifficultyStats(totalSubmissionStats, "Easy").submissions ?? 0,
        totalAcceptedSubmissions: getDifficultyStats(acSubmissionStats, "Easy").submissions ?? 0,
        numberOfProblemsAttempted: getDifficultyStats(totalSubmissionStats, "Easy").count ?? 0,

        beats: getDifficultyStats(beatsStats, "Easy").percentage ?? 0,
    };

    const medium = {
        problemsSolved: getDifficultyStats(acSubmissionStats, "Medium").count ?? 0,
        totalQuestions: getDifficultyStats(allQuestionsCount, "Medium").count ?? 0,
        totalSubmissions: getDifficultyStats(totalSubmissionStats, "Medium").submissions ?? 0,
        totalAcceptedSubmissions: getDifficultyStats(acSubmissionStats, "Medium").submissions ?? 0,
        numberOfProblemsAttempted: getDifficultyStats(totalSubmissionStats, "Medium").count ?? 0,

        beats: getDifficultyStats(beatsStats, "Medium").percentage ?? 0,
    };

    const hard = {
        problemsSolved: getDifficultyStats(acSubmissionStats, "Hard").count ?? 0,
        totalQuestions: getDifficultyStats(allQuestionsCount, "Hard").count ?? 0,
        totalSubmissions: getDifficultyStats(totalSubmissionStats, "Hard").submissions ?? 0,
        totalAcceptedSubmissions: getDifficultyStats(acSubmissionStats, "Hard").submissions ?? 0,
        numberOfProblemsAttempted: getDifficultyStats(totalSubmissionStats, "Hard").count ?? 0,

        beats: getDifficultyStats(beatsStats, "Hard").percentage ?? 0,
    };

    const difficulty = { all, easy, medium, hard };

    difficulty.all.acceptanceRate = calculateAcceptanceRate(difficulty.all.totalAcceptedSubmissions, difficulty.all.totalSubmissions);
    difficulty.easy.acceptanceRate = calculateAcceptanceRate(difficulty.easy.totalAcceptedSubmissions, difficulty.easy.totalSubmissions);
    difficulty.medium.acceptanceRate = calculateAcceptanceRate(difficulty.medium.totalAcceptedSubmissions, difficulty.medium.totalSubmissions);
    difficulty.hard.acceptanceRate = calculateAcceptanceRate(difficulty.hard.totalAcceptedSubmissions, difficulty.hard.totalSubmissions);

    // ============================================
    // SKILLS
    // ============================================
    const tagProblemCounts = user?.tagProblemCounts ?? {};
    const skills = {
        advanced: Array.isArray(tagProblemCounts?.advanced) ? tagProblemCounts.advanced : [],
        intermediate: Array.isArray(tagProblemCounts?.intermediate) ? tagProblemCounts.intermediate : [],
        fundamental: Array.isArray(tagProblemCounts?.fundamental) ? tagProblemCounts.fundamental : [],
    };

    // ============================================
    // RANK
    // ============================================
    const rank = {
        globalRanking: profile?.ranking ?? 0,
    };

    // ============================================
    // ACTIVITY
    // ============================================
    const { calendar, totalSubmissions, totalActiveDays, streak, activeYears } = mapLeetCodeCalendar(response);

    const activity = {
        calendar,
        calendarTotalSubmissions: totalSubmissions,
        calendarTotalActiveDays: totalActiveDays,
        calendarMaxStreak: streak,
        activeYears,
        yearlyData: {},
    };

    return {
        username: typeof user.username === "string" ? user.username : "",
        realName: typeof profile.realName === "string" ? profile.realName : "",
        avatar: typeof profile.userAvatar === "string" ? profile.userAvatar : "",
        error: null,
        rank,
        skills,
        difficulty,
        activity,
    };
};

export const mapLeetCodeCalendar = (response) => {
    const userCalendar = response?.matchedUser?.userCalendar;
    if (!userCalendar) {
        throw new Error("Calendar data not found in API response");
    }
    const calendar = parseSubmissionCalendar(userCalendar?.submissionCalendar);
    const totalSubmissions =Object.values(calendar).reduce((total, count) =>total + Number(count || 0),0);
    const totalActiveDays = userCalendar?.totalActiveDays ?? Object.keys(calendar).length;
    const streak = userCalendar?.streak ?? 0;
    const activeYears = userCalendar?.activeYears ?? [];
    return {calendar,totalSubmissions,totalActiveDays,streak,activeYears};
};