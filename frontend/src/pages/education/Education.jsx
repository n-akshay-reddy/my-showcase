import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./Education.css";

const ARC_LENGTH = 189;
const ORB_RADIUS = 8;
const SMOOTH_TIME = 0.3; // seconds the line takes to catch up with the scroll
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const countUp = (el) => {
    const to = Number(el.dataset.to);
    const decimals = (el.dataset.to.split(".")[1] || "").length;
    if (reduceMotion()) {
        el.textContent = to.toFixed(decimals);
        return;
    }
    const start = performance.now() + 500;
    const tick = (now) => {
        const p = Math.max(0, Math.min(1, (now - start) / 1600));
        el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

const Education = () => {
    const items = useSelector((state) => state.education.data);
    const pathRef = useRef(null);
    const railRef = useRef(null);
    const fillRef = useRef(null);
    const orbRef = useRef(null);

    useEffect(() => {
        const path = pathRef.current;
        const rail = railRef.current;
        const fill = fillRef.current;
        const orb = orbRef.current;
        const stages = [...path.querySelectorAll(".edu-stage")];
        const nodes = stages.map((stage) => stage.querySelector(".edu-node"));

        let nodeY = [];
        let railLength = 1;
        let raw = 0;
        let target = 0;
        let current = 0;
        let lit = 0;
        let velocity = 0;
        let frame = null;
        let last = 0;

        const measure = () => {
            nodeY = nodes.map((node, i) => stages[i].offsetTop + node.offsetTop + node.offsetHeight / 2);
            railLength = Math.max(1, nodeY[nodeY.length - 1] - nodeY[0]);
            rail.style.top = `${nodeY[0]}px`;
            rail.style.height = `${railLength}px`;
            orb.style.top = `${nodeY[0]}px`;
        };

        const readScroll = () => {
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            raw = window.innerHeight * 0.55 - path.getBoundingClientRect().top - nodeY[0];
            target = atBottom ? railLength : Math.max(0, Math.min(railLength, raw));
        };

        const paint = () => {
            fill.style.transform = `scaleY(${current / railLength})`;
            orb.style.transform = `translate3d(0, ${current - ORB_RADIUS}px, 0)`;

            let count = 0;
            if (raw >= 0 || target === railLength) {
                while (count < nodes.length && nodeY[count] - nodeY[0] <= current + 0.5) count++;
            }
            if (count !== lit) {
                lit = count;
                nodes.forEach((node, i) => node.classList.toggle("on", i < lit));
            }
        };

        const smoothDamp = (from, to, dt) => {
            const omega = 2 / SMOOTH_TIME;
            const x = omega * dt;
            const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
            const change = from - to;
            const temp = (velocity + omega * change) * dt;
            velocity = (velocity - omega * temp) * decay;
            return to + (change + temp) * decay;
        };

        const tick = (now) => {
            const dt = Math.min(0.05, (now - (last || now)) / 1000);
            last = now;
            current = Math.max(0, Math.min(railLength, smoothDamp(current, target, dt)));
            if (Math.abs(target - current) < 0.2 && Math.abs(velocity) < 1) {
                current = target;
                velocity = 0;
                frame = null;
                last = 0;
            } else {
                frame = requestAnimationFrame(tick);
            }
            paint();
        };

        const onScroll = () => {
            readScroll();
            if (reduceMotion()) {
                current = target;
                paint();
            } else if (!frame) {
                last = 0;
                frame = requestAnimationFrame(tick);
            }
        };

        const onResize = () => {
            measure();
            readScroll();
            current = target;
            velocity = 0;
            paint();
        };

        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(({ isIntersecting, target: stage }) => {
                    if (!isIntersecting) return;
                    stage.classList.add("visible");
                    observer.unobserve(stage);
                    stage.querySelectorAll(".edu-count").forEach(countUp);
                }),
            { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );
        const resizeObserver = new ResizeObserver(onResize);

        stages.forEach((stage) => observer.observe(stage));
        resizeObserver.observe(path);
        onResize();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
        };
    }, [items]);

    return (
        <main className="edu page-content">
            <section className="edu-hero">
                <span className="edu-eyebrow">Education</span>
                <h1>
                    Sixteen years of <span className="edu-gradient">levelling up.</span>
                </h1>
                <p>From school to a Computer Science degree, the path that shaped how I build.</p>
            </section>

            <div className="edu-path" ref={pathRef}>
                <div className="edu-rail" ref={railRef}>
                    <div className="edu-fill" ref={fillRef} />
                </div>
                <div className="edu-orb" ref={orbRef} />

                {items.map((item, index) => {
                    const { grade, accent } = item;
                    const percent = grade.scale ? (grade.value / grade.scale) * 100 : grade.value;
                    const years = item.endYear - item.startYear;
                    const side = index % 2 ? "right" : "left";
                    const gradientId = `edu-grad-${item.id}`;

                    return (
                        <section
                            key={item.id}
                            className={`edu-stage ${side}`}
                            style={{ "--a1": accent[0], "--a2": accent[1] }}
                        >
                            <div className="edu-node" />

                            <div className="edu-year">
                                <b>{item.startYear}</b>
                                <span>→ {item.endYear} · {years} years</span>
                            </div>

                            <article className="edu-card">
                                <div className="edu-head">
                                    <div className="edu-mono">{item.mono}</div>
                                    <div>
                                        <div className="edu-level">
                                            Level {String(index + 1).padStart(2, "0")} · {item.level}
                                        </div>
                                        <div className="edu-period">{item.startYear} – {item.endYear}</div>
                                    </div>
                                </div>

                                <h2>{item.institution}</h2>
                                <p className="edu-degree">{item.degree}</p>
                                <p className="edu-location">{item.location}</p>
                                {item.board && <span className="edu-board">Board · {item.board}</span>}

                                <div className="edu-foot">
                                    <div
                                        className="edu-gauge"
                                        style={{ "--offset": ARC_LENGTH * (1 - percent / 100) }}
                                    >
                                        <svg viewBox="0 0 140 76">
                                            <defs>
                                                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0" className="edu-stop-a" />
                                                    <stop offset="1" className="edu-stop-b" />
                                                </linearGradient>
                                            </defs>
                                            <path className="track" d="M10 70A60 60 0 0 1 130 70" />
                                            <path
                                                className="value"
                                                d="M10 70A60 60 0 0 1 130 70"
                                                stroke={`url(#${gradientId})`}
                                            />
                                        </svg>
                                        <div className="edu-gauge-text">
                                            <b>
                                                <span className="edu-count" data-to={grade.value}>0</span>
                                                {!grade.scale && "%"}
                                            </b>
                                            <small>{grade.scale ? `${grade.type} / ${grade.scale}` : grade.type}</small>
                                        </div>
                                    </div>
                                    <span className="edu-status">✓ {item.status}</span>
                                </div>
                            </article>
                        </section>
                    );
                })}

                <section
                    className={`edu-stage ${items.length % 2 ? "right" : "left"}`}
                    style={{ "--a1": "#fb923c", "--a2": "#9333ea", marginBottom: 0 }}
                >
                    <div className="edu-node pulse" />
                    <div className="edu-year">
                        <b>Now</b>
                        <span>2025 → present</span>
                    </div>
                    <Link to="/about/experience" className="edu-card edu-now">
                        <div className="edu-level">Career · Present</div>
                        <h2>Work Experience</h2>
                        <p>Degree done, now building real products and shipping features end to end.</p>
                        <span className="edu-cta">
                            View my work experience <span className="edu-arrow">→</span>
                        </span>
                    </Link>
                </section>
            </div>
        </main>
    );
};

export default Education;