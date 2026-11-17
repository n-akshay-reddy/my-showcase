import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../state-management/Achievements/achievementsSlice";
import "./Achievements.css";

const SKY_BARS = 80;
const heights = Array.from(
    { length: SKY_BARS },
    (_, k) => 34 + Math.abs(Math.sin(k * 1.7) * 38 + Math.cos(k * 0.6) * 18)
);

function RankCard({ item }) {
    const marker = Math.max(1, Math.round(item.position * SKY_BARS));

    return (
        <div className="ac-card ac-rank">
            <div className="ac-rank-top">
                <div className="ac-big">{item.metric}<small>{item.unit}</small></div>
                <span className="ac-chip">{item.level}</span>
            </div>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <div className="ac-sky">
                {heights.map((h, k) => (
                    <i key={k} className={k < marker ? "is-me" : ""} style={{ "--h": `${h}%`, "--k": k }} />
                ))}
                <div className="ac-pin" style={{ "--x": `${(marker / SKY_BARS) * 100}%` }}><b>Me</b></div>
            </div>
            <div className="ac-axis"><span>Front</span><em>{item.ahead}</em></div>
        </div>
    );
}

function CertCard({ item }) {
    return (
        <div className="ac-card ac-cert">
            <div className="ac-stub">{item.icon}</div>
            <div className="ac-cert-body">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

function MedalCard({ item }) {
    return (
        <div className="ac-card ac-medal">
            <div className="ac-medal-wrap">
                <div className="ac-ribbon" />
                <div className={`ac-disc ac-disc--${item.metal}`}>{item.metric}</div>
            </div>
            <div>
                <span className="ac-chip">{item.chip}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

function BadgeCard({ item }) {
    return (
        <div className="ac-card ac-badge">
            <div className="ac-hex">{item.icon}</div>
            <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

const cardByKind = { rank: RankCard, cert: CertCard, medal: MedalCard, badge: BadgeCard };

const tabs = [
    {
        id: "tech",
        label: "💻 Technical",
        sections: [
            { kind: "rank", title: "Where I finished", caption: "Every bar is a slice of the field, best on the left. The pin is where I landed." },
            { kind: "cert", title: "Certificates", caption: "Programmes I completed and events I took part in." },
        ],
    },
    {
        id: "non",
        label: "🏅 Non-technical",
        sections: [
            { kind: "medal", title: "On the field", caption: "Medals from the pitch and the mat." },
            { kind: "badge", title: "Discipline and service", caption: "Uniforms that taught me to lead and to follow." },
        ],
    },
];

function Achievements() {
    const dispatch = useDispatch();
    const { data, activeTab } = useSelector((state) => state.achievements);
    const tab = tabs.find((t) => t.id === activeTab);

    return (
        <main className="ac">
            <section className="ac-hero">
                <h1>Wins on the keyboard, <span className="ac-grad">and off it.</span></h1>
                <p className="ac-sub">Two arenas, one mindset: show up, compete, improve. Pick an arena to see the wins.</p>
                <div className={`ac-switch${activeTab === "non" ? " is-two" : ""}`} role="tablist">
                    <i />
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={t.id === activeTab}
                            onClick={() => dispatch(setActiveTab(t.id))}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </section>

            <section key={tab.id} className="ac-panel">
                {tab.sections.map(({ kind, title, caption }) => {
                    const Card = cardByKind[kind];

                    return (
                        <div key={kind}>
                            <h3>{title}</h3>
                            <p className="ac-cap">{caption}</p>
                            <div className="ac-grid">
                                {data.filter((item) => item.kind === kind).map((item) => (
                                    <Card key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}

export default Achievements;