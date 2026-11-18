import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeCompany, openCompany } from "../../state-management/Experience/experienceSlice";
import CompanyCard from "../../components/experience/CompanyCard/CompanyCard";
import WorkWindow from "../../components/experience/WorkWindow/WorkWindow";
import "./Experience.css";

export default function Experience() {
    const dispatch = useDispatch();
    const timelineRef = useRef(null);
    const { companies, openCompanyId } = useSelector((state) => state.experience);

    useEffect(() => {
        const el = timelineRef.current;
        if (!el) return;
        let raf = 0;
        const clamp = (v) => Math.min(1, Math.max(0, v));

        const update = () => {
            raf = 0;
            const dots = el.querySelectorAll(".exp-dot");
            if (!dots.length) return;

            const vh = window.innerHeight;
            const mid = vh * 0.5;

            // Near the page bottom, move the reach point from the middle toward the bottom
            // of the screen so the last node can always be reached.
            const remaining = document.documentElement.scrollHeight - (window.scrollY + vh);
            const k = clamp(1 - remaining / (vh * 0.5));
            const trigger = mid + (vh * 0.95 - mid) * k;

            // The line runs from the first dot's center to the last dot's center.
            const tr = el.getBoundingClientRect();
            const f = dots[0].getBoundingClientRect();
            const l = dots[dots.length - 1].getBoundingClientRect();
            const startY = f.top + f.height / 2 - tr.top;
            const endY = l.top + l.height / 2 - tr.top;
            const len = Math.max(0, endY - startY);

            el.style.setProperty("--ls", `${startY}px`);
            el.style.setProperty("--lh", `${len}px`);

            const p = len ? clamp((trigger - (tr.top + startY)) / len) : 0;
            el.style.setProperty("--p", p);
            el.classList.toggle("is-complete", p >= 0.999);

            el.querySelectorAll(".exp-item").forEach((item) => {
                const r = item.getBoundingClientRect();
                item.classList.toggle("is-reached", r.top + r.height / 2 <= trigger);
            });
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        // Cards change height (fonts load, hover details), so re-measure when that happens.
        const ro = new ResizeObserver(onScroll);
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            ro.disconnect();
        };
    }, [companies]);

    // Derived from the store: when Sreevi changes openCompanyId, the window opens by itself.
    const openCompanyData = companies.find((company) => company.id === openCompanyId);

    const handleOpen = useCallback((id) => dispatch(openCompany(id)), [dispatch]);
    const handleClose = useCallback(() => dispatch(closeCompany()), [dispatch]);

    return (
        <div className="exp-page">
            <main className="exp-main">
                <section className="exp-hero">
                    <div className="exp-kicker">Experience</div>
                    <h1>
                        I fix what breaks and <span className="exp-gradient">build what’s missing.</span>
                    </h1>
                    <p className="exp-sub">Open a company, then hover any highlight to see the details.</p>
                </section>

                <div className="exp-timeline" ref={timelineRef}>
                    {companies.map((company, index) => (
                        <div className="exp-item" key={company.id}>
                            <span className="exp-dot" />
                            <CompanyCard company={company} index={index} onOpen={handleOpen} />
                        </div>
                    ))}
                </div>
            </main>

            {openCompanyData && <WorkWindow key={openCompanyData.id} company={openCompanyData} onClose={handleClose} />}
        </div>
    );
}