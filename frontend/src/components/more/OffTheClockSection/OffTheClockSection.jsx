import { useSelector } from "react-redux";
import "./OffTheClockSection.css";

// Look of each polaroid (photo gradient + tilt). Picked by position, so new items need no styling data.
const LOOKS = [
    { a: "#9333ea", b: "#6366f1", tilt: "-3deg" },
    { a: "#ec4899", b: "#fb923c", tilt: "2deg" },
    { a: "#0ea5e9", b: "#6366f1", tilt: "-1.5deg" },
    { a: "#f97316", b: "#ec4899", tilt: "2.5deg" },
    { a: "#7c3aed", b: "#ec4899", tilt: "-2deg" },
];

export default function OffTheClockSection() {
    const items = useSelector((state) => state.more.data.offTheClock);

    return (
        <div className="polaroids">
            {items.map((item, i) => {
                const look = LOOKS[i % LOOKS.length];
                return (
                    <div
                        className="polaroid"
                        key={item.title}
                        style={{ "--a": look.a, "--b": look.b, "--r": look.tilt }}
                    >
                        <div className="polaroid-photo">
                            <span>{item.icon}</span>
                        </div>
                        <h3 className="polaroid-title">{item.title}</h3>
                        <p className="polaroid-caption">{item.description}</p>
                    </div>
                );
            })}
        </div>
    );
}