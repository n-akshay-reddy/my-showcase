import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, Code2, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import "./ComingSoon.css";

const ComingSoon = () => {
    const { pathname } = useLocation();
    const NAV = useSelector((state) => state.navBar);

    const currentPage = NAV.flatMap((item) => item.children ? item.children : [item]).find((item) => item.to === pathname);
    const pageName = currentPage?.label ?? "This section";

    return (
        <main className="coming-soon">
            <div className="coming-soon__glow coming-soon__glow--one" />
            <div className="coming-soon__glow coming-soon__glow--two" />

            <section className="coming-soon__card">
                <div className="coming-soon__icon">
                    <Code2 size={30} strokeWidth={1.7} />
                    <span><Sparkles size={15} /></span>
                </div>

                <div className="coming-soon__eyebrow"><Clock3 size={14} /> CURRENTLY IN DEVELOPMENT</div>

                <h1><span>{pageName}</span> is on the way.</h1>

                <p className="coming-soon__description">I'm building this part of my portfolio to share more about my journey, skills, projects, and experiences. This section isn't ready just yet, but there's more coming soon.</p>

                <div className="coming-soon__status">
                    <span className="coming-soon__status-dot" />
                    <span>Building something worth the wait</span>
                </div>

                <div className="coming-soon__actions">
                    <Link to="/" className="coming-soon__button coming-soon__button--primary"><ArrowLeft size={16} /> Back to Home</Link>
                    <Link to="/leetcode" className="coming-soon__button coming-soon__button--secondary">Explore LeetCode <ArrowRight size={16} /></Link>
                </div>

                <div className="coming-soon__footer">MORE OF MY STORY · COMING SOON</div>
            </section>
        </main>
    );
};

export default ComingSoon;
