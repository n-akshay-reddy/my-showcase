import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
    closeCompany,
    openCompany,
    setExperienceData,
    setExperienceError,
    setExperienceStatus,
} from "../../state-management/experience/experienceSlice";
import { getExperience } from "./experienceservice";
import CompanyCard from "../../components/experience/CompanyCard/CompanyCard";
import WorkWindow from "../../components/experience/WorkWindow/Workwindow";
import "./Experience.css";

export default function Experience() {
    const dispatch = useDispatch();
    const store = useStore();
    const timelineRef = useRef(null);
    const { companies, status, error, openCompanyId } = useSelector((state) => state.experience);

    // Fetch only when the data is missing: status "idle" or "error".
    const loadExperience = useCallback(async () => {
        const { status } = store.getState().experience;
        if (status === "loading" || status === "loaded") return;

        dispatch(setExperienceStatus("loading"));
        try {
            dispatch(setExperienceData(await getExperience()));
        } catch (err) {
            dispatch(setExperienceError(err.message));
        }
    }, [dispatch, store]);

    useEffect(() => {
        loadExperience();
    }, [loadExperience]);

    // Fills the line as you scroll and marks the dots the line has passed.
    useEffect(() => {
        if (status !== "loaded") return;
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
    }, [status]);

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

                {(status === "idle" || status === "loading") && <div className="exp-state">Loading experience…</div>}

                {status === "error" && (
                    <div className="exp-state">
                        <p>{error}</p>
                        <button type="button" className="exp-retry" onClick={loadExperience}>Try Again</button>
                    </div>
                )}

                {status === "loaded" && (
                    <div className="exp-timeline" ref={timelineRef}>
                        {companies.map((company, index) => (
                            <div className="exp-item" key={company.id}>
                                <span className="exp-dot" />
                                <CompanyCard company={company} index={index} onOpen={handleOpen} />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {openCompanyData && <WorkWindow key={openCompanyData.id} company={openCompanyData} onClose={handleClose} />}
        </div>
    );
}