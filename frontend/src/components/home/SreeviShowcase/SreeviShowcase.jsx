import { useEffect, useRef, useState } from "react";
import { profile } from "../../../data/profile";

const getProfileLink = (name) => profile.find((item) => item.name === name)?.href;
import {
    ArrowUpRight,
    BookOpenText,
    Briefcase,
    Check,
    Code2,
    Compass,
    FileText,
    Gauge,
    GitBranch,
    Layers,
    LayoutDashboard,
    Mail,
    MousePointerClick,
    Network,
    Package,
    Palette,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import "./SreeviShowcase.css";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// TODO: replace with your real links
const LINKS = {
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-handle",
    leetcode: "https://leetcode.com/u/your-handle",
};

const TICKER_MS = 2400; // keep in sync with `sreevi-cap` duration in the CSS
const DRAG_MARGIN = 24; // how far past the stage edge a card may be dragged
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const TICKER = [
    { icon: Compass, text: "Navigates any page" },
    { icon: MousePointerClick, text: "Opens LeetCode stats" },
    { icon: Palette, text: "Switches the theme" },
    { icon: LayoutDashboard, text: "Rearranges the layout" },
    { icon: Layers, text: "Scrolls to a section" },
    { icon: Search, text: "Highlights a project" },
    { icon: BookOpenText, text: "Finds the right project" },
    { icon: Briefcase, text: "Answers about his work" },
    { icon: FileText, text: "Opens resume & contact" },
    { icon: Mail, text: "Drafts a hiring email" },
];

/** Display-only demos: command types in, actions run, result types out. */
const CAPABILITIES = [
    {
        icon: Compass,
        tint: "violet",
        chip: "Navigate",
        title: "Navigate the site",
        example: "Show me Akshay's LeetCode stats",
        steps: [
            "Navigator: opening /leetcode",
            "Data fetcher: loading profile",
            "Visualizer: drawing stats",
        ],
        result: "Opened /leetcode. 1100+ problems solved.",
        highlight: "problems",
    },
    {
        icon: BookOpenText,
        tint: "pink",
        chip: "Projects",
        title: "Find the right project",
        example: "Where did Akshay use RAG?",
        steps: [
            "Retriever: searching projects",
            "Reader: matching RAG work",
            "Composer: drafting the answer",
        ],
        result: "DocuVault: that's where Akshay worked on RAG.",
        highlight: "ai",
    },
    {
        icon: Briefcase,
        tint: "orange",
        chip: "Experience",
        title: "Answer about his work",
        example: "Show his AgentExchange apps",
        steps: [
            "Retriever: searching experience",
            "Reader: picking highlights",
            "Composer: drafting the answer",
        ],
        result: "DocuMake, Contacto & DocuVault.",
        highlight: "products",
    },
    {
        icon: Palette,
        tint: "green",
        chip: "Theme & layout",
        title: "Control theme & layout",
        example: "Switch to dark mode",
        steps: ["Theme controller: updating theme", "Layout: applying changes"],
        result: "Theme updated across the whole page.",
        highlight: null,
    },
    {
        icon: Mail,
        tint: "blue",
        chip: "Hire",
        title: "Hire Akshay",
        example: "I want to hire Akshay",
        steps: [
            "Navigator: opening /more/contact",
            "Mailer: drafting the hiring email",
            "Downloader: fetching resume.pdf",
        ],
        result: "Contact page is open. Should I download the resume?",
        highlight: null,
    },
];

/** `slot` picks the card's position in the CSS (`sreevi-float--card-<slot>`). */
const CARDS = [
    {
        id: "ai", slot: "top-left", icon: Network, tint: "pink",
        title: "APPLIED AI",
        headline: "RAG on AWS Bedrock",
        note: "Plus a multi-agent AI portfolio",
    },
    {
        id: "fullstack", slot: "top-right", icon: Code2, tint: "violet",
        title: "SOFTWARE ENGINEERING",
        headline: "Complex systems, end to end",
        note: "Custom Word engine, Drive-like sharing & document pipelines",
        tags: ["Java", "Apex", "React", "Node"],
    },
    {
        id: "limits", slot: "bottom-left", icon: Gauge, tint: "teal",
        title: "BEYOND LIMITS",
        headline: "Engineered past platform limits",
        stats: [
            { value: "20MB+", label: "files vs a 5MB heap" },
            { value: "200k+", label: "records exported" },
        ],
    },
    {
        id: "problems", slot: "bottom-right", icon: TrendingUp, tint: "green",
        title: "PROBLEM SOLVING",
        headline: "1100+ problems solved",
        note: "LeetCode",
    },
    {
        id: "products", slot: "left", icon: Package, tint: "blue",
        title: "PRODUCT ENGINEERING",
        headline: "DocuMake, Contacto & DocuVault",
        note: "Complete applications for AgentExchange",
    },
    {
        id: "oss", slot: "right", icon: GitBranch, tint: "orange",
        title: "OPEN SOURCE",
        headline: "Apex XLSX utility",
        note: "Designed a developer-friendly spreadsheet parsing API",
    },
];

const PILLS = [
    { slot: "github", label: "GitHub", color: "var(--sv-text)", href: getProfileLink("GitHub") },
    { slot: "linkedin", label: "LinkedIn", color: "#0a66c2", href: getProfileLink("LinkedIn") },
    { slot: "leetcode", label: "LeetCode", color: "#f28a16", href: getProfileLink("LeetCode") },
];

const DOTS = [
    { slot: "top", color: "#ffc933", size: 16 },
    { slot: "left", color: "#34c77b", size: 12 },
    { slot: "right", color: "#4a90ff", size: 14 },
];

const STATUS_LABEL = {
    typing: "Reading request",
    working: "Working",
    replying: "Working",
    done: "Done",
};

const EMPTY_RUN = { example: "", stepsShown: 0, stepsDone: 0, result: "", phase: "typing" };

const finishedRun = (cap) => ({
    example: cap.example,
    stepsShown: cap.steps.length,
    stepsDone: cap.steps.length,
    result: cap.result,
    phase: "done",
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(
        () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCED_MOTION_QUERY).matches
    );

    useEffect(() => {
        const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
        if (!query) return undefined;

        const onChange = () => setReduced(query.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    return reduced;
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

/** Avatar. All inner sizes are derived from `--orb-size` in the CSS. */
function Orb({ size = 56, halo = false }) {
    return (
        <span className="sreevi-orb-wrap">
            {halo && <span className="sreevi-orb__halo" />}
            <span className="sreevi-orb" style={{ "--orb-size": `${size}px` }}>
                <span className="sreevi-orb__eyes">
                    <i className="sreevi-orb__eye" />
                    <i className="sreevi-orb__eye" />
                </span>
                <i className="sreevi-orb__mouth" />
            </span>
        </span>
    );
}

/**
 * Floating wrapper. The outer element runs the drift animation; when
 * `draggable` is set, an inner element carries the drag offset so the two
 * transforms never conflict. Changing `resetKey` slides the item back to
 * its slot.
 */
function Float({ className, draggable = false, resetKey = 0, children }) {
    const drag = useRef(null);
    const isFirstRender = useRef(true);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [moved, setMoved] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return undefined;
        }
        setOffset({ x: 0, y: 0 });
        const timer = setTimeout(() => setMoved(false), 260); // after the slide-back finishes
        return () => clearTimeout(timer);
    }, [resetKey]);

    const handlePointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;

        const el = e.currentTarget;
        const stageEl = el.closest(".sreevi-stage");
        if (!stageEl) return;

        const stage = stageEl.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        drag.current = {
            startX: e.clientX,
            startY: e.clientY,
            originX: offset.x,
            originY: offset.y,
            minX: offset.x + (stage.left - DRAG_MARGIN - rect.left),
            maxX: offset.x + (stage.right + DRAG_MARGIN - rect.right),
            minY: offset.y + (stage.top - DRAG_MARGIN - rect.top),
            maxY: offset.y + (stage.bottom + DRAG_MARGIN - rect.bottom),
        };
        el.setPointerCapture(e.pointerId);
        setDragging(true);
    };

    const handlePointerMove = (e) => {
        const d = drag.current;
        if (!d) return;

        setMoved(true);
        setOffset({
            x: clamp(d.originX + e.clientX - d.startX, d.minX, d.maxX),
            y: clamp(d.originY + e.clientY - d.startY, d.minY, d.maxY),
        });
    };

    const endDrag = () => {
        drag.current = null;
        setDragging(false);
    };

    const stateClasses = `${dragging ? " is-dragging" : ""}${moved ? " is-moved" : ""}`;

    return (
        <div className={`sreevi-float ${className}${stateClasses}`}>
            {draggable ? (
                <div
                    className="sreevi-drag"
                    style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                >
                    {children}
                </div>
            ) : (
                children
            )}
        </div>
    );
}

function SreeviShowcase() {
    const reduced = usePrefersReducedMotion();
    const [active, setActive] = useState(0);
    const [run, setRun] = useState(EMPTY_RUN);
    const [tick, setTick] = useState(0);
    const [resetKey, setResetKey] = useState(0);

    /* Ticker under the name: one ability at a time */
    useEffect(() => {
        if (reduced) return undefined;

        const id = setInterval(() => setTick((t) => (t + 1) % TICKER.length), TICKER_MS);
        return () => clearInterval(id);
    }, [reduced]);

    /* Work demo: command types in, actions run, result types out */
    useEffect(() => {
        if (reduced) {
            setActive(0);
            setRun(finishedRun(CAPABILITIES[0]));
            return undefined;
        }

        let cancelled = false;

        const patch = (changes) => {
            if (!cancelled) setRun((prev) => ({ ...prev, ...changes }));
        };

        const typeInto = async (key, text, speed) => {
            for (let i = 1; i <= text.length && !cancelled; i += 1) {
                patch({ [key]: text.slice(0, i) });
                await sleep(speed);
            }
        };

        (async () => {
            let index = 0;

            while (!cancelled) {
                const cap = CAPABILITIES[index];

                setActive(index);
                patch(EMPTY_RUN);
                await sleep(500);

                await typeInto("example", cap.example, 34);
                await sleep(400);

                patch({ phase: "working" });
                for (let step = 1; step <= cap.steps.length; step += 1) {
                    patch({ stepsShown: step });
                    await sleep(750);
                    patch({ stepsDone: step });
                    await sleep(120);
                }

                patch({ phase: "replying" });
                await typeInto("result", cap.result, 22);
                patch({ phase: "done" });
                await sleep(2400);

                index = (index + 1) % CAPABILITIES.length;
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reduced]);

    const current = CAPABILITIES[active];
    const CurrentIcon = current.icon;
    const { icon: TickIcon, text: tickText } = TICKER[tick];

    return (
        <div className="sreevi-stage" aria-label="Sreevi, the portfolio assistant, and what she can do">
            <div className="sreevi-glow" />
            <div className="sreevi-ring" />

            {/* Skill cards (draggable) */}
            {CARDS.map((card) => {
                const Icon = card.icon;
                return (
                    <Float
                        key={card.id}
                        className={`sreevi-float--card sreevi-float--card-${card.slot}`}
                        draggable
                        resetKey={resetKey}
                    >
                        <div
                            className={`sreevi-card sreevi-tint--${card.tint}${
                                current.highlight === card.id ? " is-active" : ""
                            }`}
                        >
                            <span className="sreevi-card__icon">
                                <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                            </span>
                            <span className="sreevi-card__body">
                                <span className="sreevi-card__title">{card.title}</span>
                                <span className="sreevi-card__headline">{card.headline}</span>
                                {card.stats && (
                                    <span className="sreevi-card__stats">
                                        {card.stats.map((stat) => (
                                            <span key={stat.label}>
                                                <b>{stat.value}</b> {stat.label}
                                            </span>
                                        ))}
                                    </span>
                                )}
                                {card.tags && (
                                    <span>
                                        {card.tags.map((tag) => (
                                            <span className="sreevi-tag" key={tag}>{tag}</span>
                                        ))}
                                    </span>
                                )}
                                {card.note && <span className="sreevi-card__note">{card.note}</span>}
                            </span>
                        </div>
                    </Float>
                );
            })}

            {/* Link pills */}
            {PILLS.map((pill) => (
                <Float key={pill.slot} className={`sreevi-float--pill-${pill.slot}`}>
                    <a className="sreevi-pill" href={pill.href} target="_blank" rel="noreferrer">
                        <i style={{ background: pill.color }} />
                        {pill.label}
                        <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                </Float>
            ))}

            {/* Decorative dots */}
            {DOTS.map((dot) => (
                <Float key={dot.slot} className={`sreevi-float--dot-${dot.slot}`}>
                    <span
                        className="sreevi-dot"
                        style={{ width: dot.size, height: dot.size, background: dot.color }}
                    />
                </Float>
            ))}

            {/* Chat window */}
            <div className="sreevi-chat">
                <header className="sreevi-chat__header">
                    <div className="sreevi-chat__id">
                        <div className="sreevi-chat__nameRow">
                            <span className="sreevi-chat__name">Sreevi</span>
                            <span className="sreevi-chat__badge">
                                <Sparkles size={11} aria-hidden="true" /> Coming soon
                            </span>
                        </div>
                        <div className="sreevi-chat__cap">
                            <span className="sreevi-chat__capLabel">Sreevi can:</span>
                            <span key={tick} className="sreevi-chat__capItem">
                                <TickIcon size={13} strokeWidth={2.3} aria-hidden="true" />
                                {tickText}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sreevi-chat__avatar"
                        aria-label="Send the cards back behind Sreevi"
                        onClick={() => setResetKey((key) => key + 1)}
                    >
                        <Orb size={46} halo />
                    </button>
                </header>

                <div className="sreevi-chat__body">
                    <div className="sreevi-work">
                        <div className="sreevi-work__head">
                            <span className={`sreevi-work__icon sreevi-tint--${current.tint}`}>
                                <CurrentIcon size={15} strokeWidth={2.2} aria-hidden="true" />
                            </span>
                            <span className="sreevi-work__title">{current.title}</span>
                            <span className={`sreevi-work__status is-${run.phase}`}>
                                {run.phase === "done" ? (
                                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                                ) : (
                                    <span className="sreevi-work__dots" aria-hidden="true">
                                        <i /><i /><i />
                                    </span>
                                )}
                                {STATUS_LABEL[run.phase]}
                            </span>
                        </div>

                        <div className="sreevi-cmd">
                            <span className="sreevi-cmd__prompt" aria-hidden="true">›</span>
                            <span className="sreevi-cmd__text">
                                {run.example}
                                {run.phase === "typing" && <span className="sreevi-caret" />}
                            </span>
                        </div>

                        <div className="sreevi-log">
                            {run.stepsShown === 0 && (
                                <span className="sreevi-log__empty">Actions will appear here</span>
                            )}
                            {current.steps.slice(0, run.stepsShown).map((label, i) => (
                                <div className="sreevi-log__row" key={label}>
                                    <span className="sreevi-log__icon">
                                        {i < run.stepsDone ? (
                                            <Check size={14} strokeWidth={3} className="sreevi-log__check" />
                                        ) : (
                                            <span className="sreevi-log__spinner" />
                                        )}
                                    </span>
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="sreevi-reply">
                            {run.result && (
                                <>
                                    <Orb size={22} />
                                    <div className="sreevi-reply__bubble">
                                        {run.result}
                                        {run.phase === "replying" && <span className="sreevi-caret" />}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="sreevi-chips">
                        {CAPABILITIES.map((cap, i) => (
                            <span
                                key={cap.chip}
                                className={`sreevi-chip${i === active ? " is-active" : ""}`}
                            >
                                {cap.chip}
                            </span>
                        ))}
                    </div>
                </div>

                <footer className="sreevi-chat__footer">
                    <Sparkles size={13} aria-hidden="true" />
                    Sreevi is in development. This is a preview.
                </footer>
            </div>
        </div>
    );
}

export default SreeviShowcase;