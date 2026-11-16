import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setActiveTab } from "../../state-management/More/moreSlice";
import MoreTabs from "../../components/more/MoreTabs/MoreTabs"
import StrengthsSection from "../../components/more/StrengthsSection/StrengthsSection";
import OffTheClockSection from "../../components/more/OffTheClockSection/OffTheClockSection";
import HobbiesSection from "../../components/more/HobbiesSection/HobbiesSection";
import PassionsSection from "../../components/more/PassionsSection/PassionsSection";
import ValuesSection from "../../components/more/ValuesSection/ValuesSection";
import "./More.css";

const PANELS = [
    {
        icon: "🧠",
        name: "Strengths",
        title: "What I bring to a",
        accent: "team.",
        subtitle: "Grouped by how they help. Pick one to see it in action.",
        Section: StrengthsSection,
    },
    {
        icon: "⚡",
        name: "Off the clock",
        title: "Off the",
        accent: "clock.",
        subtitle: "A few snapshots from life outside the editor.",
        Section: OffTheClockSection,
    },
    {
        icon: "🎧",
        name: "Things I enjoy",
        title: "Things I",
        accent: "enjoy.",
        subtitle: "The small stuff between deploys. Rearrange it however you like.",
        Section: HobbiesSection,
    },
    {
        icon: "🔮",
        name: "Fascinations",
        title: "Things that",
        accent: "fascinate me.",
        subtitle: "Things I can happily lose hours in.",
        Section: PassionsSection,
    },
    {
        icon: "🧭",
        name: "Values",
        title: "What I",
        accent: "believe in.",
        subtitle: "My climb. Watch the trail, or tap a flag to jump to it.",
        Section: ValuesSection,
    },
];

const TAB_LABELS = PANELS.map((panel) => `${panel.icon} ${panel.name}`);

export default function More() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const active = useSelector((state) => state.more.activeTab);
    const tabsAnchor = useRef(null);

    const { title, accent, subtitle, Section } = PANELS[active];
    const isLast = active === PANELS.length - 1;

    const goNext = () => {
        if (isLast) {
            navigate("/contact");
            return;
        }
        dispatch(setActiveTab(active + 1));
        tabsAnchor.current.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div className="more-page">
            <header className="more-hero">
                <h1>
                    Beyond the code, there’s a <span className="more-gradient">whole person.</span>
                </h1>
                <p className="more-sub">Five small windows into how I work, play and think.</p>
                <div ref={tabsAnchor}>
                    <MoreTabs tabs={TAB_LABELS} active={active} onChange={(i) => dispatch(setActiveTab(i))} />
                </div>
            </header>

            <section className="more-panel" key={active}>
                <div className="more-panel-head">
                    <h2>
                        {title} <span className="more-gradient">{accent}</span>
                    </h2>
                    <p className="more-sub">{subtitle}</p>
                </div>

                <Section />

                <button className={`more-next${isLast ? " final" : ""}`} onClick={goNext}>
                    {isLast ? (
                        <>
                            Got a project in mind? <strong>Let’s build something great together</strong>
                        </>
                    ) : (
                        <>
                            Next up <strong>{PANELS[active + 1].name}</strong>
                        </>
                    )}
                    <span className="more-next-arrow">→</span>
                </button>
            </section>
        </div>
    );
}