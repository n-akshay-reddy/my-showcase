import { useEffect, useRef, useState } from "react";
import "./MoreTabs.css";

export default function MoreTabs({ tabs, active, onChange }) {
    const tabRefs = useRef([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useEffect(() => {
        let cancelled = false;

        const measure = () => {
            const tab = tabRefs.current[active];
            if (!tab || cancelled) return;
            setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
            tab.scrollIntoView({ inline: "center", block: "nearest" });
        };

        measure();
        document.fonts.ready.then(measure);
        window.addEventListener("resize", measure);

        return () => {
            cancelled = true;
            window.removeEventListener("resize", measure);
        };
    }, [active]);

    return (
        <div className="more-tabs" role="tablist">
            <i
                className="more-tabs-indicator"
                style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
            />
            {tabs.map((label, i) => (
                <button
                    key={label}
                    ref={(el) => (tabRefs.current[i] = el)}
                    className="more-tab"
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => onChange(i)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}