
import { useEffect, useRef, useState } from "react";
import { profile as quickBarItems } from "../../../data/profile";
import "./QuickNavBar.css";

const SIDE_RATIO = 0.25;
const SIDE_OFFSET = 30;
const EDGE_MARGIN = 20;
const DRAG_THRESHOLD = 6;
const GHOST_VARIANT = "glow"; // "dots" | "glow"

const getZone = (x) => {
    const ratio = x / window.innerWidth;
    if (ratio < SIDE_RATIO) return "left";
    if (ratio > 1 - SIDE_RATIO) return "right";
    return "bottom";
};

const QuickNavBar = () => {
    const containerRef = useRef(null);
    const ghostRef = useRef(null);
    const sessionRef = useRef(null);
    const didDragRef = useRef(false);
    const cleanupRef = useRef(null);

    const [zone, setZone] = useState("bottom");
    const [sideY, setSideY] = useState(0);
    const [drag, setDrag] = useState(null);

    const isDragging = drag !== null;
    const activeZone = isDragging ? getZone(drag.x) : zone;

    const clampY = (y) => {
        const h = ghostRef.current?.offsetHeight || containerRef.current?.offsetHeight || 0;
        const min = h / 2 + EDGE_MARGIN;
        const max = window.innerHeight - h / 2 - EDGE_MARGIN;
        return Math.min(Math.max(y, min), Math.max(min, max));
    };

    const dockedStyle = (z, y) => {
        if (z === "bottom") return {};
        return { top: y, bottom: "auto", left: z === "left" ? SIDE_OFFSET : "auto", right: z === "right" ? SIDE_OFFSET : "auto", transform: "translateY(-50%)" };
    };

    const barStyle = isDragging ? { top: drag.y, left: drag.x, bottom: "auto", right: "auto", transform: "translate(-50%, -50%)" } : dockedStyle(zone, sideY);
    const ghostStyle = isDragging ? dockedStyle(activeZone, clampY(drag.y)) : {};

    const resetIcons = () => {
        const container = containerRef.current;
        if (!container) return;
        container.querySelectorAll("img").forEach((img) => {
            img.style.transform = "translate(0, 0) scale(1)";
            const parent = img.parentElement;
            if (parent) {
                parent.style.zIndex = "1";
                parent.classList.remove("is-active");
            }
        });
    };

    const magnify = (e) => {
        const container = containerRef.current;
        if (!container) return;
        const horizontal = activeZone === "bottom";
        const pointer = horizontal ? e.clientX : e.clientY;

        container.querySelectorAll("img").forEach((img) => {
            const rect = img.getBoundingClientRect();
            const center = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
            const distance = Math.abs(pointer - center);
            const scale = Math.max(0.85, 1.8 - distance / 150);
            const lift = Math.max(0, (scale - 1) * 18);
            const move = activeZone === "bottom" ? `translate(0, -${lift}px)` : activeZone === "left" ? `translate(${lift}px, 0)` : `translate(-${lift}px, 0)`;

            img.style.transform = `${move} scale(${scale})`;

            const parent = img.parentElement;
            if (parent) {
                parent.style.zIndex = scale > 1.05 ? "10" : "1";
                parent.classList.toggle("is-active", scale > 1.05);
            }
        });
    };

    const finishDrag = () => {
        const s = sessionRef.current;
        cleanupRef.current?.();
        cleanupRef.current = null;
        sessionRef.current = null;

        if (s?.active) {
            const finalZone = getZone(s.x);
            if (finalZone !== "bottom") setSideY(clampY(s.y));
            setZone(finalZone);
            setDrag(null);
            resetIcons();
        }
    };

    const handlePointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;

        cleanupRef.current?.();
        didDragRef.current = false;
        sessionRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false };

        const onMove = (ev) => {
            const s = sessionRef.current;
            if (!s || ev.pointerId !== s.pointerId) return;

            if (ev.pointerType === "mouse" && ev.buttons === 0) {
                finishDrag();
                return;
            }

            s.x = ev.clientX;
            s.y = ev.clientY;

            if (!s.active) {
                const moved = Math.hypot(ev.clientX - s.startX, ev.clientY - s.startY);
                if (moved < DRAG_THRESHOLD) return;
                s.active = true;
                didDragRef.current = true;
                try {
                    containerRef.current?.setPointerCapture(s.pointerId);
                } catch {
                    // Pointer capture is optional.
                }
                resetIcons();
            }

            setDrag({ x: s.x, y: s.y });
        };

        const onUp = (ev) => {
            const s = sessionRef.current;
            if (s && ev.pointerId === s.pointerId) finishDrag();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        window.addEventListener("blur", finishDrag);

        cleanupRef.current = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            window.removeEventListener("blur", finishDrag);
        };
    };

    const handlePointerMove = (e) => {
        if (sessionRef.current) return;
        magnify(e);
    };

    const handlePointerLeave = () => {
        if (!sessionRef.current) resetIcons();
    };

    const handleClickCapture = (e) => {
        if (didDragRef.current) {
            e.preventDefault();
            e.stopPropagation();
            didDragRef.current = false;
        }
    };

    useEffect(() => {
        return () => cleanupRef.current?.();
    }, []);

    const items = quickBarItems.map((item, index) => (
        <a key={index} href={item.href} className="icon" target="_blank" rel="noopener noreferrer" draggable={false}>
            <img src={item.icon} alt={item.name} draggable={false} />
            <span className="tooltip">{item.tooltip}</span>
        </a>
    ));

    return (
        <>
            {isDragging && (
                <div ref={ghostRef} className={`quick-nav-bar quick-nav-ghost ghost-${GHOST_VARIANT} is-${activeZone}`} style={ghostStyle} aria-hidden="true">
                    {quickBarItems.map((_, index) => (
                        <span key={index} className="ghost-slot" style={{ animationDelay: `${index * 0.12}s` }} />
                    ))}
                </div>
            )}
            <div ref={containerRef} className={`quick-nav-bar is-${activeZone} ${isDragging ? "is-dragging" : ""}`} style={barStyle} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onClickCapture={handleClickCapture}>
                {items}
            </div>
        </>
    );
};

export default QuickNavBar;
