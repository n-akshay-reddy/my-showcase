import { useRef } from "react";
import { profile as quickBarItems } from "../../../data/profile";
import "./QuickNavBar.css";

const QuickNavBar = () => {
    const containerRef = useRef();

    const handleMouseMove = (e) => {
        const container = containerRef.current;
        if (!container) return;
        const imgs = container.querySelectorAll("img");
        const mouseX = e.clientX;

        imgs.forEach((img) => {
            const rect = img.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX - center);

            const maxScale = 1.8;
            const minScale = 0.85;

            const scale = Math.max(minScale, maxScale - distance / 150);
            const lift = Math.max(0, (scale - 1) * 18);

            img.style.transform = `translateY(-${lift}px) scale(${scale})`;

            const parent = img.parentElement;

            if (parent) {
                parent.style.zIndex = scale > 1.05 ? "10" : "1";
                parent.classList.toggle(
                    "is-active",
                    scale > 1.05
                );
            }
        });
    };

    const handleMouseLeave = () => {
        const container = containerRef.current;
        if (!container) return;
        const imgs = container.querySelectorAll("img");

        imgs.forEach((img) => {
            img.style.transform = "translateY(0) scale(1)";
            const parent = img.parentElement;

            if (parent) {
                parent.style.zIndex = "1";
                parent.classList.remove("is-active");
            }
        });
    };

    return (
        <div className="quick-nav-bar" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {quickBarItems.map((item, index) => (
                <a key={index} href={item.href} className="icon" target="_blank" rel="noopener noreferrer">
                    <img src={item.icon} alt={item.name} />
                    <span className="tooltip">{item.tooltip}</span>
                </a>
            ))}
        </div>
    );
};

export default QuickNavBar;