import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveValue } from "../../../state-management/More/moreSlice";
import { RAIN_DROPS, RAINBOW_ARCS, SCENES, STARS, TRAIL_PATH, TREES, flagFractions, getFrame } from "./mountainScenes";
import "./ValuesSection.css";

const CONFETTI_COLORS = ["#fb923c", "#ec4899", "#9333ea", "#fbbf24", "#22d3ee"];
const TEAMMATES = [
    { dx: -26, dy: 22, color: "#ec4899" },
    { dx: -52, dy: 44, color: "#fb923c" },
    { dx: 22, dy: 26, color: "#22d3ee" },
];
const AUTO_STEP_MS = 5600;
const PAUSE_AFTER_CLICK_MS = 9000;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ValuesSection() {
    const dispatch = useDispatch();
    const values = useSelector((state) => state.more.data.values);
    const active = useSelector((state) => state.more.activeValue);

    const scenes = useMemo(() => values.map((value) => SCENES[value.scene] ?? SCENES.midday), [values]);
    const fractions = useMemo(() => flagFractions(values.length), [values.length]);

    const trailRef = useRef(null);
    const walkedRef = useRef(null);
    const stormRef = useRef(0);
    const hovering = useRef(false);
    const pausedUntil = useRef(0);

    const [trail, setTrail] = useState(null); // { length, flags: [{ x, y }] }
    const [position, setPosition] = useState(null); // { distance, x, y } of the hiker
    const [walking, setWalking] = useState(false);
    const [flash, setFlash] = useState(false);
    const [confetti, setConfetti] = useState([]);

    // measure the trail once it is on screen
    useEffect(() => {
        const path = trailRef.current;
        const length = path.getTotalLength();
        setTrail({ length, flags: fractions.map((f) => path.getPointAtLength(f * length)) });
    }, [fractions]);

    // walk the hiker to the active flag
    useEffect(() => {
        if (!trail) return;

        const path = trailRef.current;
        const target = fractions[active] * trail.length;
        const from = walkedRef.current;

        const moveTo = (distance) => {
            const point = path.getPointAtLength(distance);
            walkedRef.current = distance;
            setPosition({ distance, x: point.x, y: point.y });
        };

        if (from === null || from === target || prefersReducedMotion()) {
            moveTo(target);
            return;
        }

        const duration = target < from ? 1000 : 1600;
        const start = performance.now();
        let frame;

        setWalking(true);

        const step = (now) => {
            const k = Math.min(1, (now - start) / duration);
            const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            moveTo(from + (target - from) * eased);

            if (k < 1) {
                frame = requestAnimationFrame(step);
                return;
            }

            setWalking(false);
            if (active === values.length - 1) {
                setConfetti(
                    Array.from({ length: 30 }, (_, i) => ({
                        dx: (Math.random() - 0.5) * 300,
                        dy: -Math.random() * 170 + 30,
                        rot: Math.random() * 720 - 360,
                        w: 5 + Math.random() * 5,
                        h: 8 + Math.random() * 6,
                        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    }))
                );
                setTimeout(() => setConfetti([]), 1900);
            }
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [active, trail, fractions, values.length]);

    // move to the next value on its own, unless the visitor is looking around
    useEffect(() => {
        if (prefersReducedMotion()) return;

        const id = setInterval(() => {
            if (hovering.current || Date.now() < pausedUntil.current) return;
            dispatch(setActiveValue((active + 1) % values.length));
        }, AUTO_STEP_MS);

        return () => clearInterval(id);
    }, [active, values.length, dispatch]);

    // lightning while the storm is overhead
    useEffect(() => {
        const id = setInterval(() => {
            if (stormRef.current > 0.6) {
                setFlash(true);
                setTimeout(() => setFlash(false), 600);
            }
        }, 2600);

        return () => clearInterval(id);
    }, []);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark-mode";
    const progress = trail && position ? position.distance / trail.length : fractions[0];
    const frame = getFrame(progress, scenes, fractions, isDark);

    useEffect(() => {
        stormRef.current = frame.storm;
    });

    const choose = (i) => {
        pausedUntil.current = Date.now() + PAUSE_AFTER_CLICK_MS;
        dispatch(setActiveValue(i));
    };

    const current = values[active];
    const summit = trail?.flags[values.length - 1];

    return (
        <div className="values">
            <div
                className="values-stage"
                style={{ "--sky-top": frame.skyTop, "--sky-bottom": frame.skyBottom }}
                onMouseEnter={() => (hovering.current = true)}
                onMouseLeave={() => (hovering.current = false)}
            >
                <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <defs>
                        <linearGradient id="vsSky" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" style={{ stopColor: "var(--sky-top)" }} />
                            <stop offset="1" style={{ stopColor: "var(--sky-bottom)" }} />
                        </linearGradient>
                        <linearGradient id="vsMountain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" style={{ stopColor: "var(--m1)" }} />
                            <stop offset="1" style={{ stopColor: "var(--m2)" }} />
                        </linearGradient>
                        <linearGradient id="vsProgress" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#fb923c" />
                            <stop offset=".5" stopColor="#ec4899" />
                            <stop offset="1" stopColor="#9333ea" />
                        </linearGradient>
                        <linearGradient id="vsMist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#fff" stopOpacity="0" />
                            <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="vsAurora" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#34d399" stopOpacity="0" />
                            <stop offset=".3" stopColor="#22d3ee" />
                            <stop offset=".6" stopColor="#a78bfa" />
                            <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
                        </linearGradient>
                        <filter id="vsBlur" x="-20%" y="-50%" width="140%" height="200%">
                            <feGaussianBlur stdDeviation="16" />
                        </filter>
                    </defs>

                    <rect width="1000" height="560" fill="url(#vsSky)" />

                    {/* stars and aurora fade in towards the summit night */}
                    <g opacity={frame.night}>
                        {STARS.map((star, i) => (
                            <circle
                                key={i}
                                className="values-twinkle"
                                cx={star.cx}
                                cy={star.cy}
                                r={star.r}
                                fill="#fff"
                                style={{ animationDelay: `${star.delay}s` }}
                            />
                        ))}
                    </g>
                    <g opacity={frame.night * 0.9} filter="url(#vsBlur)">
                        <path
                            className="values-aurora-wave"
                            d="M-60 150C200 40 400 220 650 110S950 60 1100 140L1100 220C900 150 700 270 450 190S100 120 -60 230Z"
                            fill="url(#vsAurora)"
                            opacity=".75"
                        />
                        <path
                            className="values-aurora-wave"
                            style={{ animationDelay: "-4s" }}
                            d="M-60 220C150 130 380 290 620 190S940 150 1100 210L1100 280C880 230 680 340 440 270S110 210 -60 300Z"
                            fill="url(#vsAurora)"
                            opacity=".5"
                        />
                    </g>

                    {/* rainbow after the storm */}
                    <g opacity={frame.rainbow * 0.65}>
                        {RAINBOW_ARCS.map((arc) => (
                            <path key={arc.color} d={arc.d} fill="none" stroke={arc.color} strokeWidth="11" />
                        ))}
                    </g>

                    <g transform={`translate(${frame.sunX} ${frame.sunY})`} opacity={1 - frame.storm * 0.9}>
                        <circle r="175" opacity=".12" fill={frame.sunColor} />
                        <circle r="105" opacity=".2" fill={frame.sunColor} />
                        <circle r="54" fill={frame.sunColor} />
                    </g>

                    <g className="values-clouds" fill="#fff" opacity={0.75 * (1 - frame.storm)}>
                        <rect x="90" y="250" width="140" height="26" rx="13" />
                        <rect x="130" y="232" width="80" height="26" rx="13" />
                        <rect x="560" y="120" width="120" height="22" rx="11" />
                        <rect x="590" y="104" width="64" height="22" rx="11" />
                    </g>

                    <g opacity={frame.storm * 0.95} fill="#2f2d4a">
                        <ellipse cx="120" cy="50" rx="200" ry="52" />
                        <ellipse cx="420" cy="30" rx="240" ry="58" />
                        <ellipse cx="740" cy="52" rx="260" ry="60" />
                        <ellipse cx="980" cy="36" rx="200" ry="56" />
                    </g>
                    <path
                        className={`values-bolt${flash ? " on" : ""}`}
                        d="M450 40L425 130L455 130L418 240"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="5"
                        strokeLinejoin="round"
                        opacity="0"
                    />

                    <g fill="none" className="values-birds" stroke="#2a2540" strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M200 120q8-9 16 0q8-9 16 0" />
                        <path d="M262 96q6-7 12 0q6-7 12 0" />
                    </g>
                    <text className="values-twinkle" x="430" y="70" fontSize="20" fill="#f59e0b">✦</text>
                    <text className="values-twinkle" style={{ animationDelay: ".6s" }} x="560" y="46" fontSize="14" fill="#f59e0b">✦</text>
                    <text className="values-twinkle" style={{ animationDelay: "1.1s" }} x="660" y="150" fontSize="16" fill="#f59e0b">✦</text>

                    {/* far hills, mountain, mist and the hill in front */}
                    <path d="M-60 560V400L120 320L220 400L330 300L450 400L560 330L680 420L1060 330V560Z" fill="var(--m3)" />
                    <rect x="-60" y="340" width="1120" height="150" fill="url(#vsMist)" opacity=".6" />
                    <path d="M240 560L820 70L1060 340V560Z" fill="url(#vsMountain)" />
                    <path d="M820 70L1060 340V560H760L850 250Z" fill="#000" opacity=".16" />
                    <path d="M820 70L790 200L720 300M820 70L850 210L900 300" stroke="#fff" strokeOpacity=".2" strokeWidth="3" fill="none" />
                    <path d="M820 70L772 112L800 104L820 128L842 106L866 118Z" fill="#fff" />
                    <rect y="440" width="1000" height="110" fill="url(#vsMist)" opacity=".4" />
                    <path d="M-60 560V505Q150 465 300 520T600 540T1060 515V560Z" fill="var(--m4)" />
                    {TREES.map(([x, y]) => (
                        <g key={`${x}-${y}`}>
                            <polygon points={`${x},${y - 48} ${x - 17},${y} ${x + 17},${y}`} fill="#4c1d95" />
                            <polygon points={`${x},${y - 68} ${x - 13},${y - 30} ${x + 13},${y - 30}`} fill="#5b21b6" />
                        </g>
                    ))}

                    {/* trail, progress, flags */}
                    <path
                        ref={trailRef}
                        d={TRAIL_PATH}
                        fill="none"
                        stroke="#fff"
                        strokeOpacity=".7"
                        strokeWidth="5"
                        strokeDasharray="2 12"
                        strokeLinecap="round"
                    />
                    {trail && position && (
                        <path
                            d={TRAIL_PATH}
                            fill="none"
                            stroke="url(#vsProgress)"
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={trail.length}
                            strokeDashoffset={trail.length - position.distance}
                        />
                    )}

                    {trail &&
                        values.map((value, i) => {
                            const p = trail.flags[i];
                            if (!p) return null;
                            return (
                                <g
                                    key={value.id ?? value.choose}
                                    className={`values-flag${i === active ? " on" : ""}`}
                                    transform={`translate(${p.x} ${p.y})`}
                                    onClick={() => choose(i)}
                                >
                                    <circle className="values-flag-hit" cx="6" cy="-18" r="28" fill="transparent" />
                                    {i === values.length - 1 && <circle className="values-pulse" r="26" fill="#fde68a" opacity=".55" />}
                                    <g className="values-flag-body">
                                        <line y2="-36" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                        <path className="values-pennant" d="M0 -36L28 -28L0 -20Z" fill="url(#vsProgress)" />
                                        <circle r="11" fill="#fff" stroke="url(#vsProgress)" strokeWidth="3" />
                                        <text y="4" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2a2540">
                                            {i + 1}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                    {/* teammates waiting at the summit */}
                    {summit && (
                        <g opacity={frame.team}>
                            {TEAMMATES.map((mate) => (
                                <g key={mate.color} transform={`translate(${summit.x + mate.dx} ${summit.y + mate.dy})`}>
                                    <g className="values-teammate">
                                        <circle cy="-22" r="5" fill="#fde1c7" />
                                        <rect x="-5" y="-17" width="10" height="16" rx="4" fill={mate.color} />
                                        <path d="M-3 -2v6M3 -2v6" stroke="#2a2540" strokeWidth="3" strokeLinecap="round" />
                                    </g>
                                </g>
                            ))}
                        </g>
                    )}

                    {position && (
                        <g transform={`translate(${position.x} ${position.y})`} className={walking ? "values-walking" : undefined}>
                            <g className="values-bob">
                                <ellipse cy="2" rx="12" ry="3.5" fill="#000" opacity=".25" />
                                <g transform="translate(-3,-10)">
                                    <g className="values-leg-a">
                                        <line y2="10" stroke="#2a2540" strokeWidth="4" strokeLinecap="round" />
                                    </g>
                                </g>
                                <g transform="translate(3,-10)">
                                    <g className="values-leg-b">
                                        <line y2="10" stroke="#2a2540" strokeWidth="4" strokeLinecap="round" />
                                    </g>
                                </g>
                                <rect x="-11" y="-30" width="6" height="14" rx="3" fill="#2a2540" />
                                <rect x="-7" y="-32" width="14" height="22" rx="6" fill="url(#vsProgress)" />
                                <circle cy="-38" r="7" fill="#fde1c7" />
                                <path d="M-7 -39Q0 -49 7 -39Z" fill="#2a2540" />
                                <path d="M9 -22L13 2" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        </g>
                    )}

                    {summit &&
                        confetti.map((piece, i) => (
                            <rect
                                key={i}
                                className="values-confetti"
                                x={summit.x}
                                y={summit.y - 30}
                                width={piece.w}
                                height={piece.h}
                                rx="2"
                                fill={piece.color}
                                style={{ "--dx": `${piece.dx}px`, "--dy": `${piece.dy}px`, "--r": `${piece.rot}deg` }}
                            />
                        ))}

                    <g opacity={frame.storm * 0.9}>
                        {RAIN_DROPS.map((drop, i) => (
                            <line
                                key={i}
                                className="values-drop"
                                x1={drop.x}
                                y1="-30"
                                x2={drop.x - 10}
                                y2="0"
                                style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }}
                            />
                        ))}
                    </g>
                    <rect className={`values-flash${flash ? " on" : ""}`} width="1000" height="560" fill="#fff" opacity="0" />
                </svg>

                {trail &&
                    values.map((value, i) => {
                        const p = trail.flags[i];
                        if (!p) return null;
                        return (
                            <button
                                key={value.id ?? value.choose}
                                className={`values-flag-label${i === active ? " on" : ""}`}
                                style={{ left: `${p.x / 10}%`, top: `${p.y / 5.6}%` }}
                                onClick={() => choose(i)}
                            >
                                {value.choose}
                            </button>
                        );
                    })}
            </div>

            <div className="values-card" key={active}>
                <div className="values-card-top">
                    <small>I choose</small>
                    <em>
                        {String(active + 1).padStart(2, "0")} · {scenes[active].label}
                    </em>
                </div>
                <h3>{current.choose}</h3>
                <span className="values-over">over {current.over}</span>
                <strong className="values-tagline">{current.tagline}</strong>
                <p>{current.description}</p>
                <div className="values-steps">
                    {values.map((value, i) => (
                        <button
                            key={value.id ?? value.choose}
                            className={i === active ? "on" : undefined}
                            aria-label={`Value ${i + 1}: ${value.choose}`}
                            onClick={() => choose(i)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}