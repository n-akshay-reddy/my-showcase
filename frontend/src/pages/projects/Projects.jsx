import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    toggleProject,
    closeProject,
    openNextProject,
} from "../../state-management/Projects/ProjectsSlice";
import "./Projects.css";

const pad = (n) => String(n + 1).padStart(2, "0");

/* ---------- Right-hand preview card (works for any project) ---------- */
function Preview({ project }) {
    return (
        <aside className="pj-preview" aria-hidden="true">
            <span className="pj-preview-grid" />
            <span className={`pj-status pj-status--${project.status === "Completed" ? "done" : "wip"}`}>
                <i /> {project.status}
            </span>
            <p className="pj-preview-line">{project.tagline}</p>
            <ul className="pj-preview-stack">
                {project.stack.slice(0, 6).map((s, i) => (
                    <li key={s} style={{ "--i": i }}>{s}</li>
                ))}
            </ul>
        </aside>
    );
}

/* ---------- Expanded details of one project ---------- */
function Details({ project }) {
    const [step, setStep] = useState(0);
    const ch = project.challenges?.[step];

    return (
        <div className="pj-body">
            <div className="pj-main">
                <h3 className="pj-title">{project.tagline}</h3>
                <p className="pj-desc">{project.description}</p>

                {project.metrics?.length > 0 && (
                    <div className="pj-kpis">
                        {project.metrics.map((m) => (
                            <div key={m.label}>
                                <b>{m.value}</b>
                                <span>{m.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {project.features?.length > 0 && (
                    <ul className="pj-features">
                        {project.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                )}

                {ch && (
                    <div className="pj-story">
                        <div className="pj-story-head">
                            <span>The story</span>
                            {project.challenges.length > 1 && (
                                <div className="pj-dots" role="tablist">
                                    {project.challenges.map((_, i) => (
                                        <button
                                            key={i}
                                            role="tab"
                                            aria-selected={i === step}
                                            className={i === step ? "is-on" : ""}
                                            onClick={() => setStep(i)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="pj-tri" key={step}>
                            <div><h4>Challenge</h4><p>{ch.challenge}</p></div>
                            <div><h4>Approach</h4><p>{ch.approach}</p></div>
                            <div><h4>Outcome</h4><p>{ch.outcome}</p></div>
                        </div>
                    </div>
                )}

                <ul className="pj-chips">
                    {project.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>

                {project.note && <p className="pj-note">ⓘ {project.note}</p>}

                {(project.liveUrl || project.githubUrl) && (
                    <div className="pj-actions">
                        {project.liveUrl && (
                            <a className="pj-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                                Live demo <span>↗</span>
                            </a>
                        )}
                        {project.githubUrl && (
                            <a className="pj-link" href={project.githubUrl} target="_blank" rel="noreferrer">
                                Source code <span>↗</span>
                            </a>
                        )}
                    </div>
                )}
            </div>

            <Preview project={project} />
        </div>
    );
}

/* ---------- One row of the index ---------- */
function Row({ project, index, open, onToggle }) {
    const ref = useRef(null);

    // bring the opened row into view once its panel starts growing
    useEffect(() => {
        if (open && ref.current) {
            const t = setTimeout(() => ref.current.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
            return () => clearTimeout(t);
        }
    }, [open]);

    const [a, b] = project.colors.accent;
    const [c1, c2] = project.colors.cover;

    return (
        <div
            ref={ref}
            className={`pj-row${open ? " is-open" : ""}`}
            style={{ "--a": a, "--b": b, "--c1": c1, "--c2": c2 }}
        >
            <button
                className="pj-head"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={`pj-panel-${project.id}`}
            >
                <span className="pj-no">{pad(index)}</span>
                <span className="pj-name">{project.name}</span>
                <span className="pj-tag">{project.tag}</span>
                <span className="pj-plus" aria-hidden="true">+</span>
            </button>
            <div className="pj-panel" id={`pj-panel-${project.id}`} role="region">
                <div>{open && <Details project={project} />}</div>
            </div>
        </div>
    );
}

/* ---------- Small card for the "more" section ---------- */
function MoreCard({ item }) {
    return (
        <article className="pj-card">
            <span className="pj-card-tag">{item.tag}</span>
            <h4>{item.name}</h4>
            <p>{item.description}</p>
            <ul className="pj-chips pj-chips--sm">
                {item.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="pj-card-links">
                {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noreferrer">Live ↗</a>}
                {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noreferrer">Code ↗</a>}
            </div>
        </article>
    );
}

/* ---------- Page ---------- */
function Projects() {
    const dispatch = useDispatch();
    const { data, status, error, openProjectId } = useSelector((state) => state.projects);
    const projects = data?.projects ?? [];
    const more = data?.moreProjects ?? [];

    if (status === "loading") return <main className="pj"><p className="pj-state">Loading projects…</p></main>;
    if (status === "error") return <main className="pj"><p className="pj-state">Couldn’t load projects. {error}</p></main>;

    return (
        <main className="pj">
            <section className="pj-hero">
                <div>
                    <span className="pj-eyebrow">Projects</span>
                    <h1>Things I’ve built, <span className="pj-grad">in my own words.</span></h1>
                </div>
                <p className="pj-hint">
                    {projects.length} featured · {more.length} more below.<br />
                    Click a name to open it.
                </p>
            </section>

            <section className="pj-index">
                {projects.map((p, i) => (
                    <Row
                        key={p.id}
                        project={p}
                        index={i}
                        open={openProjectId === p.id}
                        onToggle={() => dispatch(toggleProject(p.id))}
                    />
                ))}
            </section>

            {openProjectId && (
                <div className="pj-controls">
                    <button onClick={() => dispatch(openNextProject())}>Next project →</button>
                    <button onClick={() => dispatch(closeProject())}>Close</button>
                </div>
            )}

            {more.length > 0 && (
                <section className="pj-more">
                    <h2>More <span className="pj-grad">experiments</span></h2>
                    <p className="pj-hint">Smaller builds where I learned something new.</p>
                    <div className="pj-grid">
                        {more.map((m) => <MoreCard key={m.id} item={m} />)}
                    </div>
                </section>
            )}
        </main>
    );
}

export default Projects;