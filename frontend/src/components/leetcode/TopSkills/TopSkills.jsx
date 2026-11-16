import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { BrainCircuit, ChevronDown } from "lucide-react";

import "./TopSkills.css";

const LEVELS = [
    { key: "advanced", label: "Advanced" },
    { key: "intermediate", label: "Intermediate" },
    { key: "fundamental", label: "Fundamental" }
];

const PREVIEW_COUNT = 5;


function TopSkillsSkeleton() {
    return (
        <div className="ts__skeleton">
            {LEVELS.map(({ key, label }) => (
                <section key={key} className="ts__skeleton-group">
                    <div className="ts__skeleton-head">
                        <span className="ts__skeleton-title">{label}</span>
                        <span className="ts__skeleton-count" />
                    </div>

                    <div className="ts__skeleton-chips">
                        {[76, 96, 100, 86].map((width, index) => (
                            <span key={index} className="ts__skeleton-chip"
                                style={{ "--chip-width": `${width}px` }} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}


function Chip({ tag }) {
    return (
        <li className={"ts__chip"}>
            <span className="ts__chip-name">{tag.tagName}</span>
            <span className="ts__chip-count">{tag.problemsSolved}</span>
        </li>
    );
}



function MoreSkills({ groupKey, label, items }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);

    const triggerRef = useRef(null);
    const popRef = useRef(null);
    const openTimer = useRef(null);
    const closeTimer = useRef(null);
    const pointerType = useRef("mouse");

    const clearTimers = () => {
        clearTimeout(openTimer.current);
        clearTimeout(closeTimer.current);
    };

    const scheduleOpen = () => {
        clearTimers();
        openTimer.current = setTimeout(() => setOpen(true), 90);
    };

    const scheduleClose = () => {
        clearTimers();
        closeTimer.current = setTimeout(() => setOpen(false), 140);
    };

    useEffect(() => clearTimers, []);

    useEffect(() => {
        if (!open) {
            setPos(null);
            return undefined;
        }

        const place = () => {
            const trigger = triggerRef.current?.getBoundingClientRect();
            const pop = popRef.current;
            const card = triggerRef.current?.closest(".ts")?.getBoundingClientRect();

            if (!trigger || !pop || !card) return;

            const margin = 12;
            const gap = 10;

            const maxWidth = Math.max(0, card.width - margin * 2);
            const maxHeight = Math.max(0, card.height - margin * 2);

            pop.style.width = `${Math.min(340, maxWidth)}px`;
            pop.style.maxHeight = `${maxHeight}px`;

            const w = pop.offsetWidth;
            const h = pop.offsetHeight;

            const minLeft = card.left + margin;
            const maxLeft = Math.max(minLeft, card.right - w - margin);

            const center = trigger.left + trigger.width / 2;
            const left = Math.min(Math.max(center - w / 2, minLeft),maxLeft);

            const below = trigger.bottom + gap;
            const above = trigger.top - h - gap;
            let top;
            let placement;
            if (below + h <= card.bottom - margin) {
                top = below;
                placement = "bottom";
            } else if (above >= card.top + margin) {
                top = above;
                placement = "top";
            } else {
                top = Math.min(Math.max(below, card.top + margin),Math.max(card.top + margin, card.bottom - h - margin));
                placement =top >= trigger.bottom ? "bottom" : "top";
            }
            const arrow = Math.min(Math.max(center - left, 18),w - 18);
            setPos({ top, left, placement, arrow });
        };

        place();

        const onScroll = (e) => {
            if (popRef.current?.contains(e.target)) return;
            setOpen(false);
        };

        const onKey = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        const onOutside = (e) => {
            if (triggerRef.current?.contains(e.target) || popRef.current?.contains(e.target)) {
                return;
            }
            setOpen(false);
        };

        window.addEventListener("resize", place);
        window.addEventListener("scroll", onScroll, true);
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onOutside);

        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", onScroll, true);
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onOutside);
        };
    }, [open]);

    return (
        <>
            <button ref={triggerRef} type="button" className={`ts__more ${open ? "is-open" : ""}`}
                onPointerDown={(e) => {
                    pointerType.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") scheduleOpen();
                }}
                onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") scheduleClose();
                }}
                onFocus={scheduleOpen}
                onBlur={scheduleClose}
                onClick={() => setOpen((prev) =>
                    pointerType.current === "mouse" ? true : !prev
                )
                }
            >
                +{items.length} more <ChevronDown className="ts__more-chevron" size={12} strokeWidth={3} />
            </button>

            {open &&
                createPortal(
                    <div ref={popRef} role="group"
                        className={`ts-pop ts-pop--${groupKey} ${pos ? `is-ready is-${pos.placement}` : ""}`}
                        style={{
                            top: pos?.top ?? 0, left: pos?.left ?? 0,
                            "--arrow": `${pos?.arrow ?? 0}px`,
                            visibility: pos ? "visible" : "hidden"
                        }}
                        onPointerEnter={(e) => {
                            if (e.pointerType === "mouse") {
                                clearTimers();
                            }
                        }}
                        onPointerLeave={(e) => {
                            if (e.pointerType === "mouse") scheduleClose();
                        }}
                    >
                        <span className="ts-pop__arrow" />

                        <header className="ts-pop__header">
                            <span className="ts-pop__dot" />
                            <div>
                                <h4>More {label} skills</h4>
                                <p>{items.length} topics</p>
                            </div>
                        </header>

                        <ul className="ts__chips ts-pop__chips">
                            {items.map((tag) => (
                                <Chip key={tag.tagSlug} tag={tag} />
                            ))}
                        </ul>
                    </div>,
                    document.body
                )}
        </>
    );
}

function TopSkills() {
    const skills = useSelector((state) => state.leetcode.skills);
    const status = useSelector((state) => state.leetcode.status);

    const groups = useMemo(() =>
        LEVELS.map(({ key, label }) => ({
            key, label,
            list: [...(skills?.[key] ?? [])].sort((a, b) => b.problemsSolved - a.problemsSolved)
        })), [skills]);
    const totalSkills = groups.reduce((sum, g) => sum + g.list.length, 0);
    const hasData = totalSkills > 0;

    return (
        <aside className="ts">
            <header className="ts__header">
                <div className="ts__icon">
                    <BrainCircuit size={23} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="ts__heading">
                    <h3>Top Skills</h3>
                    <span>{status === "loaded" && hasData ? `${totalSkills} topics practised` : "Algorithms & topics"}</span>
                </div>
            </header>

            <div className="ts__body">
                {status === "loading" && <TopSkillsSkeleton />}
                {status === "loaded" && !hasData && <p className="ts__empty">No skill data available yet.</p>}
                {status === "loaded" && groups.map(({ key, label, list }) => {
                    if (!list.length) return null;

                    const rest = list.slice(PREVIEW_COUNT);

                    return (
                        <section key={key} className={`ts__group ts__group--${key}`}>
                            <div className="ts__group-head">
                                <span className="ts__dot" />
                                <span className="ts__group-title">{label}</span>
                                <span className="ts__group-count">{list.length} skills</span>
                            </div>

                            <ul className="ts__chips">
                                {list.slice(0, PREVIEW_COUNT).map((tag) => (
                                    <Chip key={tag.tagSlug} tag={tag} />
                                ))}
                            </ul>

                            {rest.length > 0 && (<MoreSkills groupKey={key} label={label} items={rest} />)}
                        </section>
                    );
                })}
            </div>
        </aside>
    );
}

export default TopSkills;