import { useSelector } from "react-redux";
import "./PassionsSection.css";

// Honeycomb rows alternate 3, 2, 3, 2 ... so the grid keeps its shape as items are added or removed.
const toRows = (items) => {
    const rows = [];
    let start = 0;
    let size = 3;
    while (start < items.length) {
        rows.push({ start, items: items.slice(start, start + size) });
        start += size;
        size = size === 3 ? 2 : 3;
    }
    return rows;
};

export default function PassionsSection() {
    const passions = useSelector((state) => state.more.data.passions);

    return (
        <div className="hexes">
            {toRows(passions).map((row, r) => (
                <div className="hex-row" key={r}>
                    {row.items.map((passion, j) => (
                        <div className="hex" key={passion.title} style={{ "--i": row.start + j }}>
                            <div className="hex-inner">
                                <span className="hex-icon">{passion.icon}</span>
                                <strong className="hex-title">{passion.title}</strong>
                                <span className="hex-desc">{passion.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}