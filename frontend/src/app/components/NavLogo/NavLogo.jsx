import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import SreeviRobot from "../SreeviRobot/SreeviRobot";
import "./NavLogo.css";

const SHOW_MS = 4000; // time on screen before the exit
const OUT_MS = 850; // name flies up into the navbar
const WORDS = ["Experience", "the", "Web", "4.0"];
const HERO_FROM = 2; // words from this index get the gradient
const HERO_STR = WORDS.slice(HERO_FROM).join("");
const GLYPHS = "01<>/#*$%&";
const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function useAtTop(threshold = 40) {
    const [top, setTop] = useState(() => window.scrollY <= threshold);
    useEffect(() => {
        const onScroll = () => setTop(window.scrollY <= threshold);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);
    return top;
}

export default function NavLogo({ onDone }) {
    const doneRef = useRef(onDone);
    const rootRef = useRef(null);
    const nameRef = useRef(null);
    const navRef = useRef(null);
    const ghostRef = useRef(null);
    const canvasRef = useRef(null);
    const timers = useRef([]);

    const theme = useSelector((state) => state.theme.mode);
    const dark = theme === "dark-mode";
    const theming = dark ? "nl--dark" : "nl--light";
    const atTop = useAtTop();

    const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
    const [phase, setPhase] = useState(reduce ? "gone" : "in"); // in -> out -> gone
    const [heroTxt, setHeroTxt] = useState(() => [...HERO_STR].map(rnd));

    // "Web 4.0" decodes from random glyphs into the real letters
    useEffect(() => {
        if (reduce) return;
        const ids = [];
        [...HERO_STR].forEach((final, i) => {
            ids.push(
                setTimeout(() => {
                    let k = 0;
                    const iv = setInterval(() => {
                        k++;
                        const ch = k >= 8 ? final : rnd();
                        setHeroTxt((t) => {
                            const c = [...t];
                            c[i] = ch;
                            return c;
                        });
                        if (k >= 8) clearInterval(iv);
                    }, 55);
                    ids.push(iv);
                }, 800 + i * 60)
            );
        });
        return () => ids.forEach((id) => { clearTimeout(id); clearInterval(id); });
    }, [reduce]);

    const leave = () => {
        timers.current.forEach(clearTimeout);
        // work out where the name has to fly to (the navbar logo)
        const src = nameRef.current;
        const dst = navRef.current;
        const root = rootRef.current;
        if (src && dst && root) {
            const a = src.getBoundingClientRect();
            const b = dst.getBoundingClientRect();
            root.style.setProperty("--fx", `${b.left + b.width / 2 - (a.left + a.width / 2)}px`);
            root.style.setProperty("--fy", `${b.top + b.height / 2 - (a.top + a.height / 2)}px`);
            root.style.setProperty("--fs", (b.width / a.width).toFixed(4));
        }
        setPhase("out");
        timers.current = [
            setTimeout(() => {
                setPhase("gone");
                doneRef.current?.();
            }, OUT_MS),
        ];
    };

    // schedule the exit + lock scrolling while the intro is up
    useEffect(() => {
        if (reduce) {
            doneRef.current?.();
            return;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        timers.current = [setTimeout(leave, SHOW_MS)];
        return () => {
            document.body.style.overflow = prev;
            timers.current.forEach(clearTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (phase === "gone") document.body.style.overflow = "";
    }, [phase]);

    // neural network that bursts out of the ghost, then reacts to the cursor / finger
    useEffect(() => {
        const c = canvasRef.current;
        if (!c || !rootRef.current) return;
        const css = getComputedStyle(rootRef.current);
        const colA = css.getPropertyValue("--nl-a").trim() || "#512A91";
        const colB = css.getPropertyValue("--nl-b").trim() || "#9D326F";
        const ctx = c.getContext("2d");
        const pts = [];
        const ptr = { x: -999, y: -999 };
        let w = 0, h = 0, raf = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = c.clientWidth;
            h = c.clientHeight;
            c.width = w * dpr;
            c.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // the burst starts from the ghost
            let cx = w / 2, cy = h * 0.4;
            if (ghostRef.current) {
                const g = ghostRef.current.getBoundingClientRect();
                const r = c.getBoundingClientRect();
                cx = g.left + g.width / 2 - r.left;
                cy = g.top + g.height / 2 - r.top;
            }
            const n = Math.round(Math.min(80, (w * h) / 11000));
            pts.length = 0;
            for (let i = 0; i < n; i++) {
                const a = Math.random() * 6.283;
                const sp = 3 + Math.random() * 8;
                pts.push({
                    x: cx, y: cy,
                    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                    bx: (Math.random() - 0.5) * 0.4, by: (Math.random() - 0.5) * 0.4,
                    r: 1 + Math.random() * 1.6,
                });
            }
        };

        const frame = () => {
            ctx.clearRect(0, 0, w, h);
            for (const p of pts) {
                p.vx += (p.bx - p.vx) * 0.035; // slow down from the burst into a gentle drift
                p.vy += (p.by - p.vy) * 0.035;
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) { p.vx *= -1; p.bx *= -1; }
                if (p.y < 0 || p.y > h) { p.vy *= -1; p.by *= -1; }
                const dx = ptr.x - p.x, dy = ptr.y - p.y, d = Math.hypot(dx, dy);
                if (d < 170 && d > 1) {
                    p.x += (dx / d) * 0.7;
                    p.y += (dy / d) * 0.7;
                }
            }
            ctx.lineWidth = 1;
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 120) {
                        ctx.globalAlpha = (1 - d / 120) * 0.35;
                        ctx.strokeStyle = colA;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
                const d = Math.hypot(p.x - ptr.x, p.y - ptr.y);
                if (d < 170) {
                    ctx.globalAlpha = (1 - d / 170) * 0.8;
                    ctx.strokeStyle = colB;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(ptr.x, ptr.y);
                    ctx.stroke();
                }
                ctx.globalAlpha = 0.85;
                ctx.fillStyle = colB;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, 6.283);
                ctx.fill();
            }
            raf = requestAnimationFrame(frame);
        };

        const move = (e) => {
            const r = c.getBoundingClientRect();
            ptr.x = e.clientX - r.left;
            ptr.y = e.clientY - r.top;
        };
        const off = () => { ptr.x = ptr.y = -999; };

        resize();
        frame();
        const onResize = () => {
            resize();
            // after a resize just let points drift, no new burst
            pts.forEach((p) => {
                p.vx = p.bx;
                p.vy = p.by;
                p.x = Math.random() * w;
                p.y = Math.random() * h;
            });
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("pointerdown", move, { passive: true });
        window.addEventListener("pointerup", off);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerdown", move);
            window.removeEventListener("pointerup", off);
        };
    }, [phase === "gone", dark]); // eslint-disable-line react-hooks/exhaustive-deps

    const onMove = (e) => {
        const el = rootRef.current;
        if (!el) return;
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
        el.style.setProperty("--px", px.toFixed(3));
        el.style.setProperty("--py", py.toFixed(3));
        // the robot's eyes follow the cursor
        el.style.setProperty("--ex", `${(px * 16).toFixed(1)}px`);
        el.style.setProperty("--ey", `${(py * 12).toFixed(1)}px`);
    };

    const hidden = phase === "gone" && !atTop;
    const waiting = phase !== "gone";

    const gradCount = HERO_STR.length;
    let n = 0;
    let g = 0;

    const renderWord = (word, hero) => (
        <span className={`nl-intro__word ${hero ? "nl-intro__word--hero" : ""}`} key={word} aria-hidden="true">
            {[...word].map((ch) => {
                const i = n++;
                const style = { "--i": i };
                if (!hero) {
                    return (
                        <span className="nl-intro__ch" style={style} key={i}>
                            {ch}
                        </span>
                    );
                }
                const gi = g++;
                style["--g"] = gradCount > 1 ? gi / (gradCount - 1) : 0;
                return (
                    <span className="nl-intro__ch" style={style} key={i}>
                        <span className="nl-intro__sizer">{ch}</span>
                        <span className="nl-intro__live">{heroTxt[gi]}</span>
                    </span>
                );
            })}
        </span>
    );

    return (
        <>
            {phase !== "gone" && (
                <div
                    ref={rootRef}
                    className={`nl-intro ${theming} ${phase === "out" ? "nl-intro--out" : ""}`}
                    onPointerMove={onMove}
                    onClick={() => phase === "in" && leave()}
                    role="presentation"
                >
                    <div className="nl-intro__bg" aria-hidden="true">
                        <span className="nl-intro__blob nl-intro__blob--a" />
                        <span className="nl-intro__blob nl-intro__blob--b" />
                        <span className="nl-intro__blob nl-intro__blob--c" />
                    </div>
                    <canvas ref={canvasRef} className="nl-intro__net" aria-hidden="true" />

                    <div className="nl-intro__stack">
                        {/* 1. the agent says hi */}
                        <div ref={ghostRef} className="nl-intro__ghostwrap" aria-hidden="true">
                            <div className="nl-intro__float">
                                <span className="nl-intro__ring" />
                                <span className="nl-intro__ring nl-intro__ring--b" />
                                <span className="nl-intro__halo" />
                                <span className="nl-intro__orbit"><i /></span>
                                <span className="nl-intro__orbit nl-intro__orbit--b"><i /></span>
                                <SreeviRobot className="nl-intro__ghost" />
                                <span className="nl-intro__shadow" />
                            </div>
                            <div className="nl-intro__chip">
                                <span className="nl-intro__hi">
                                    Hi, I&rsquo;m <b>Sreevi</b>
                                </span>
                                <span className="nl-intro__role">
                                    <i /> AI agent
                                </span>
                            </div>
                        </div>

                        {/* 2. the headline */}
                        <h1 className="nl-intro__title" aria-label={WORDS.join(" ")}>
                            {WORDS.slice(0, HERO_FROM).map((w) => renderWord(w, false))}
                            <span className="nl-intro__group">
                                {WORDS.slice(HERO_FROM).map((w) => renderWord(w, true))}
                            </span>
                        </h1>

                        {/* 3. the owner's name, which glides into the navbar */}
                        <p ref={nameRef} className="nl-intro__name">
                            <i>&lt;</i>
                            <span className="nl-intro__name-text">
                                N Akshay Kumar Reddy
                                <svg className="nl-intro__swash" viewBox="0 0 100 12" preserveAspectRatio="none">
                                    <linearGradient id="nl-swash-intro">
                                        <stop offset="0" stopColor="var(--nl-a)" />
                                        <stop offset="1" stopColor="var(--nl-b)" />
                                    </linearGradient>
                                    <path d="M1 4 Q50 -2 99 11 Q50 3 1 4 Z" fill="url(#nl-swash-intro)" />
                                </svg>
                            </span>
                            <i>/&gt;</i>
                        </p>
                    </div>

                    {/* boot sequence while the intro plays */}
                    <div className="nl-intro__hint" aria-hidden="true">
                        <span className="nl-intro__status">Waking up Sreevi</span>
                        <span className="nl-intro__status">Loading projects &amp; experience</span>
                        <span className="nl-intro__status nl-intro__status--last">Ready</span>
                    </div>
                </div>
            )}

            <Link
                ref={navRef}
                to="/"
                className={`nl nl--done ${theming} ${waiting ? "nl--wait" : ""} ${hidden ? "is-hidden" : ""}`}
            >
                <span className="nl__bracket nl__open">&lt;</span>
                <span className="nl__name">
                    N Akshay Kumar Reddy
                    <svg className="nl__swash" viewBox="0 0 100 12" preserveAspectRatio="none">
                        <linearGradient id="nl-swash">
                            <stop offset="0" stopColor="var(--nl-a)" />
                            <stop offset="1" stopColor="var(--nl-b)" />
                        </linearGradient>
                        <path d="M1 4 Q50 -2 99 11 Q50 3 1 4 Z" fill="url(#nl-swash)" />
                    </svg>
                </span>
                <span className="nl__bracket nl__close">/&gt;</span>
            </Link>
        </>
    );
}