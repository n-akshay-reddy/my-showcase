import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./HobbiesSection.css";

const COLORS = ["#9333ea", "#ec4899", "#6366f1", "#f97316", "#7c3aed", "#0ea5e9", "#e11d48"];

// [left %, top %, tilt deg]. Positions are a share of the free space on the board,
// so a sticker can never be placed or dragged outside it.
const SPOTS = [
    [3, 10, -3],
    [40, 6, 2],
    [80, 14, -2],
    [8, 46, 2],
    [44, 42, -3],
    [88, 50, 3],
    [26, 78, -2],
];

const clamp = (value) => Math.max(0, Math.min(100, value));

const spotFor = (i, compact) => {
    const [x, y, tilt] = SPOTS[i % SPOTS.length];
    if (compact) return { x: i % 2 ? 10 : 2, y: clamp(3.5 + i * 14.2), tilt, z: 1 };
    return { x, y, tilt, z: 1 };
};

export default function HobbiesSection() {
    const hobbies = useSelector((state) => state.more.data.hobbies);
    const boardRef = useRef(null);
    const grab = useRef({ x: 0, y: 0 });
    const topZ = useRef(1);
    const [compact] = useState(() => window.matchMedia("(max-width: 760px)").matches);
    const [moved, setMoved] = useState({});
    const [dragging, setDragging] = useState(null);

    const spotOf = (i) => moved[i] ?? spotFor(i, compact);
    const update = (i, patch) => setMoved((m) => ({ ...m, [i]: { ...(m[i] ?? spotFor(i, compact)), ...patch } }));

    const freeSpace = (el) => ({
        width: Math.max(1, boardRef.current.clientWidth - el.offsetWidth),
        height: Math.max(1, boardRef.current.clientHeight - el.offsetHeight),
    });

    const startDrag = (e, i) => {
        const box = boardRef.current.getBoundingClientRect();
        const free = freeSpace(e.currentTarget);
        const spot = spotOf(i);

        grab.current = {
            x: e.clientX - box.left - (spot.x / 100) * free.width,
            y: e.clientY - box.top - (spot.y / 100) * free.height,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        topZ.current += 1;
        update(i, { z: topZ.current });
        setDragging(i);
    };

    const drag = (e, i) => {
        if (dragging !== i) return;
        const box = boardRef.current.getBoundingClientRect();
        const free = freeSpace(e.currentTarget);

        update(i, {
            x: clamp(((e.clientX - box.left - grab.current.x) / free.width) * 100),
            y: clamp(((e.clientY - box.top - grab.current.y) / free.height) * 100),
        });
    };

    return (
        <div className="stickers" ref={boardRef}>
            <span className="stickers-hint">Drag the stickers around</span>
            {hobbies.map((hobby, i) => {
                const spot = spotOf(i);
                return (
                    <div
                        key={hobby.title}
                        className={`sticker${dragging === i ? " dragging" : ""}`}
                        style={{
                            left: `${spot.x}%`,
                            top: `${spot.y}%`,
                            translate: `-${spot.x}% -${spot.y}%`,
                            rotate: `${spot.tilt}deg`,
                            zIndex: spot.z,
                            background: COLORS[i % COLORS.length],
                        }}
                        onPointerDown={(e) => startDrag(e, i)}
                        onPointerMove={(e) => drag(e, i)}
                        onPointerUp={() => setDragging(null)}
                        onPointerCancel={() => setDragging(null)}
                    >
                        <span className="sticker-icon">{hobby.icon}</span>
                        {hobby.title}
                    </div>
                );
            })}
        </div>
    );
}