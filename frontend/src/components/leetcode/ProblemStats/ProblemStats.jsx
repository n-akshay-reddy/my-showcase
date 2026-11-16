import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./ProblemStats.css";

/* ------------------------------------------------------------------
   ProblemStats
   Reads state.leetcode = { status, difficulty: { all, easy, medium, hard } }
   Hover (or focus / tap) a difficulty card -> a popup shows every stat
   for that level. Leave the card -> the popup goes away.
------------------------------------------------------------------- */

const LEVELS = [
    { key: "easy", label: "Easy", r: 90, c: "#10b981", ink: "#047857", tint: "#f1fbf6", edge: "#d5f0e2" },
    { key: "medium", label: "Medium", r: 68, c: "#fbbf24", ink: "#d97706", tint: "#fffaf0", edge: "#fbe9c3" },
    { key: "hard", label: "Hard", r: 46, c: "#f43f5e", ink: "#e11d48", tint: "#fff2f4", edge: "#fbd5dc" },
];

const num = (v) => (v ?? 0).toLocaleString();
const pct = (v) => (v == null ? "--" : `${+Number(v).toFixed(2)}%`);

/* ---------------------------- icons ---------------------------- */

const BarsIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" aria-hidden="true">
        <rect x="3" y="14" width="4" height="7" rx="1.5" />
        <rect x="10" y="9" width="4" height="12" rx="1.5" />
        <rect x="17" y="3" width="4" height="18" rx="1.5" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19c0-3.2 2.7-5 6-5s6 1.8 6 5" />
        <path d="M15 14c3.2 0 5.5 1.7 6 4.5" />
    </svg>
);

const DocIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
);

/* ---------------------------- header chip ---------------------------- */

const Chip = ({ icon, label, value, note }) => (
    <div className="ps-chip">
        <span className="ps-chip-icon">{icon}</span>
        <div>
            <p className="ps-chip-label">{label}</p>
            <p className="ps-chip-value">
                {value}
                {note && <small>{note}</small>}
            </p>
        </div>
    </div>
);

/* ---------------------------- ring chart ---------------------------- */

const Ring = ({ difficulty, active, setActive }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const shown = active ? difficulty[active] : difficulty.all;
    const level = LEVELS.find((l) => l.key === active);

    return (
        <div className="ps-ring">
            <svg viewBox="0 0 200 200" role="img" aria-label="Problems solved by difficulty">
                {LEVELS.map(({ key, r, c }) => {
                    const d = difficulty[key] ?? {};
                    const frac = d.totalQuestions ? Math.min(d.problemsSolved / d.totalQuestions, 1) : 0;
                    const len = 2 * Math.PI * r;

                    return (
                        <g
                            key={key}
                            className="ps-ring-g"
                            transform="rotate(-90 100 100)"
                            style={{ opacity: active && active !== key ? 0.25 : 1 }}
                            onMouseEnter={() => setActive(key)}
                            onMouseLeave={() => setActive(null)}
                        >
                            <circle cx="100" cy="100" r={r} fill="none" stroke="#eef0f5" strokeWidth="15" />
                            <circle
                                className="ps-arc"
                                cx="100"
                                cy="100"
                                r={r}
                                fill="none"
                                stroke={c}
                                strokeWidth="15"
                                strokeLinecap="round"
                                strokeDasharray={len}
                                strokeDashoffset={ready ? len * (1 - frac) : len}
                            />
                        </g>
                    );
                })}
            </svg>

            <div className="ps-ring-center">
                <strong>{num(shown?.problemsSolved)}</strong>
                <span>{level ? level.label : "Solved"}</span>
            </div>
        </div>
    );
};

/* ---------------------------- difficulty card ---------------------------- */

const LevelCard = ({ level, data, active, setActive }) => {
    const isActive = active === level.key;
    const solved = data.problemsSolved ?? 0;
    const total = data.totalQuestions ?? 0;
    const done = total ? Math.min((solved / total) * 100, 100) : 0;
    const popId = `ps-pop-${level.key}`;

    const cardRef = useRef(null);
    const popRef = useRef(null);
    const [place, setPlace] = useState({ side: "bottom", shift: 0 });

    /* Decide where the popup opens: below the card if it fits in the
       viewport, otherwise above; and nudge it sideways to stay on screen. */
    useLayoutEffect(() => {
        if (!isActive || !cardRef.current || !popRef.current) return;

        const card = cardRef.current.getBoundingClientRect();
        const pop = popRef.current;
        const need = pop.offsetHeight + 24;
        const width = pop.offsetWidth;
        const edge = 12;

        const below = window.innerHeight - card.bottom;
        const above = card.top;
        const side = below >= need ? "bottom" : above >= need ? "top" : below >= above ? "bottom" : "top";

        const center = card.left + card.width / 2;
        const overLeft = Math.max(edge - (center - width / 2), 0);
        const overRight = Math.max(center + width / 2 - (window.innerWidth - edge), 0);

        setPlace({ side, shift: overLeft - overRight });
    }, [isActive]);

    const rows = [
        ["Remaining", num(Math.max(total - solved, 0))],
        ["Attempted", num(data.numberOfProblemsAttempted)],
        ["Accepted", num(data.totalAcceptedSubmissions)],
        ["Submissions", num(data.totalSubmissions)],
        ["Acceptance", pct(data.acceptanceRate)],
        ["Beats", pct(data.beats)],
    ];

    return (
        <div
            ref={cardRef}
            className="ps-card"
            data-active={isActive}
            tabIndex={0}
            aria-describedby={popId}
            onMouseEnter={() => setActive(level.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(level.key)}
            onBlur={() => setActive(null)}
            style={{ "--c": level.c, "--ink": level.ink, "--tint": level.tint, "--edge": level.edge }}
        >
            <div className="ps-card-head">
                <span className="ps-dot-wrap"><span className="ps-dot" /></span>
                <h3>{level.label}</h3>
            </div>

            <div className="ps-count">
                <strong>{num(solved)}</strong>
                <span>/ {num(total)}</span>
            </div>
            <p className="ps-muted">problems solved</p>

            <div className="ps-beats">
                <span className="ps-beats-icon"><UsersIcon /></span>
                <div>
                    <p className="ps-beats-line">Beats <strong>{pct(data.beats)}</strong></p>
                    <p className="ps-muted ps-xs">of LeetCode users</p>
                </div>
            </div>

            {/* popup */}
            <div
                id={popId}
                ref={popRef}
                role="tooltip"
                className="ps-pop"
                data-side={place.side}
                style={{ "--shift": `${place.shift}px` }}
            >
                <div className="ps-pop-head">
                    <span className="ps-pop-title">
                        <i className="ps-pop-dot" />
                        {level.label}
                    </span>
                    <span className="ps-pop-pct">{pct(done)}</span>
                </div>

                <div className="ps-pop-bar">
                    <i style={{ width: isActive ? `${done}%` : "0%" }} />
                </div>
                <p className="ps-pop-sub">{num(solved)} of {num(total)} solved</p>

                <dl className="ps-pop-grid">
                    {rows.map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
};

/* ---------------------------- skeleton ---------------------------- */

const Skeleton = () => (
    <section className="ps" aria-busy="true">
        <div className="ps-head">
            <div className="ps-title">
                <i className="ps-sk" style={{ width: 40, height: 40, borderRadius: 11 }} />
                <i className="ps-sk" style={{ width: 260, maxWidth: "60%", height: 24 }} />
            </div>
        </div>
        <div className="ps-body">
            <i className="ps-sk" style={{ width: 200, height: 200, borderRadius: "50%", justifySelf: "center", alignSelf: "center" }} />
            <div className="ps-levels">
                {[0, 1, 2].map((i) => (
                    <i key={i} className="ps-sk" style={{ minHeight: 210, borderRadius: 15 }} />
                ))}
            </div>
        </div>
    </section>
);

/* ---------------------------- main ---------------------------- */

const ProblemStats = () => {
    const { status, difficulty } = useSelector((s) => s.leetcode);
    const [active, setActive] = useState(null);

    if (status === "idle" || status === "loading") return <Skeleton />;
    if (status === "failed" || !difficulty) return null;

    const all = difficulty.all ?? {};

    return (
        <section className="ps" aria-label="Problems solved by difficulty">
            <div className="ps-head">
                <div className="ps-title">
                    <span className="ps-title-icon"><BarsIcon /></span>
                    <h2>Problems Solved by Difficulty</h2>
                </div>

                <div className="ps-chips">
                    <Chip
                        icon={<DocIcon />}
                        label="Total Submissions"
                        value={num(all.totalSubmissions)}
                        note={`${num(all.totalAcceptedSubmissions)} accepted`}
                    />
                    <Chip
                        icon={<span className="ps-pct">%</span>}
                        label="Acceptance Rate"
                        value={pct(all.acceptanceRate)}
                    />
                </div>
            </div>

            <div className="ps-body">
                <Ring difficulty={difficulty} active={active} setActive={setActive} />

                <div className="ps-levels">
                    {LEVELS.map((level) => (
                        <LevelCard
                            key={level.key}
                            level={level}
                            data={difficulty[level.key] ?? {}}
                            active={active}
                            setActive={setActive}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemStats;