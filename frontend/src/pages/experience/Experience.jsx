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

        const update = () => {
            raf = 0;
            const mid = window.innerHeight * 0.5;
            const rect = el.getBoundingClientRect();
            el.style.setProperty("--p", Math.min(1, Math.max(0, (mid - rect.top) / rect.height)));
            el.querySelectorAll(".exp-item").forEach((item) => {
                const r = item.getBoundingClientRect();
                item.classList.toggle("is-reached", r.top + r.height / 2 <= mid);
            });
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
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