const random = (min, max) => min + Math.random() * (max - min);

export const TRAIL_PATH =
    "M170 535C270 535 320 505 360 475S450 415 510 400S600 365 640 335S700 275 735 245S790 175 812 140S828 100 820 78";

// where the first and last flags sit along the trail (0 = start, 1 = end)
const FIRST_FLAG = 0.08;
const LAST_FLAG = 0.97;

const calm = { storm: 0, rainbow: 0, night: 0, team: 0 };

// The "scene" name on each value in the JSON points to one of these.
// storm / rainbow / night / team are effect strengths (0 to 1) that fade in and out between scenes.
export const SCENES = {
    dawn: { ...calm, label: "Dawn", skyTop: "#ffcfa3", skyBottom: "#f4b6d8", sunX: 170, sunY: 360, sunColor: "#fbbf24" },
    morning: { ...calm, label: "Morning", skyTop: "#ffe9b8", skyBottom: "#cdeaff", sunX: 330, sunY: 240, sunColor: "#fde68a" },
    midday: { ...calm, label: "Midday", skyTop: "#8ed0ff", skyBottom: "#d9efff", sunX: 540, sunY: 90, sunColor: "#fff3b0" },
    storm: { ...calm, storm: 1, label: "Storm", skyTop: "#45446a", skyBottom: "#7a7898", sunX: 600, sunY: 130, sunColor: "#cbd5e1" },
    goldenHour: { ...calm, rainbow: 1, label: "Golden hour", skyTop: "#ffb36b", skyBottom: "#ff8fb6", sunX: 860, sunY: 300, sunColor: "#fb923c" },
    dusk: { ...calm, night: 0.35, label: "Dusk", skyTop: "#6b4a9c", skyBottom: "#f0867f", sunX: 780, sunY: 340, sunColor: "#fb7185" },
    summitNight: { ...calm, night: 1, team: 1, label: "Summit night", skyTop: "#171340", skyBottom: "#3b2a7a", sunX: 930, sunY: 130, sunColor: "#f1efff" },
};

export const TREES = [
    [60, 508],
    [104, 522],
    [520, 530],
    [566, 524],
    [900, 510],
    [952, 502],
    [866, 516],
];

export const RAIN_DROPS = Array.from({ length: 46 }, () => ({
    x: random(-60, 1090),
    delay: -Math.random(),
    duration: random(0.55, 0.9),
}));

export const STARS = Array.from({ length: 44 }, () => ({
    cx: random(0, 1000),
    cy: random(0, 300),
    r: random(0.8, 2.4),
    delay: -random(0, 2),
}));

export const RAINBOW_ARCS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#38bdf8", "#8b5cf6"].map((color, k) => {
    const r = 262 - k * 11;
    return { color, d: `M${420 - r} 420A${r} ${r} 0 0 1 ${420 + r} 420` };
});

// evenly spaced flag positions along the trail, one per value
export const flagFractions = (count) =>
    Array.from({ length: count }, (_, i) =>
        count === 1 ? FIRST_FLAG : FIRST_FLAG + ((LAST_FLAG - FIRST_FLAG) * i) / (count - 1)
    );

const hex = (color) => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));

const mixColor = (from, to, t) => {
    const a = hex(from);
    const b = hex(to);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

const lerp = (from, to, t) => from + (to - from) * t;

// Everything the sky needs for a given spot on the trail (progress: 0 to 1).
// It blends between the two scenes the hiker is standing between.
export function getFrame(progress, scenes, fractions, isDark) {
    if (scenes.length < 2) return scenes[0];

    let stage = scenes.length - 1;
    if (progress <= fractions[0]) {
        stage = 0;
    } else {
        for (let k = 0; k < fractions.length - 1; k++) {
            if (progress <= fractions[k + 1]) {
                stage = k + (progress - fractions[k]) / (fractions[k + 1] - fractions[k]);
                break;
            }
        }
    }

    const k = Math.min(scenes.length - 2, Math.floor(stage));
    const f = stage - k;
    const ease = f * f * (3 - 2 * f);
    const from = scenes[k];
    const to = scenes[k + 1];

    let skyTop = mixColor(from.skyTop, to.skyTop, ease);
    let skyBottom = mixColor(from.skyBottom, to.skyBottom, ease);

    // in dark mode the daytime skies are dimmed, the last scene stays as it is
    if (isDark) {
        const dim = Math.min(0.55, (scenes.length - 1.5 - stage) * 0.6);
        if (dim > 0) {
            skyTop = mixColor(skyTop, "#0e0b24", dim);
            skyBottom = mixColor(skyBottom, "#0e0b24", dim);
        }
    }

    return {
        skyTop,
        skyBottom,
        sunX: lerp(from.sunX, to.sunX, ease),
        sunY: lerp(from.sunY, to.sunY, ease),
        sunColor: mixColor(from.sunColor, to.sunColor, ease),
        storm: lerp(from.storm, to.storm, ease),
        rainbow: lerp(from.rainbow, to.rainbow, ease),
        night: lerp(from.night, to.night, ease),
        team: lerp(from.team, to.team, ease),
    };
}