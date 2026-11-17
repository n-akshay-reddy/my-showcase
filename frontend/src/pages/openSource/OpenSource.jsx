import { useDispatch, useSelector } from "react-redux";
import { setActiveId } from "../../state-management/OpenSource/openSourceSlice";
import "./OpenSource.css";

const icons = {
    merge: (
        <svg viewBox="0 0 16 16">
            <circle cx="4" cy="3.5" r="1.8" />
            <circle cx="4" cy="12.5" r="1.8" />
            <circle cx="12" cy="8" r="1.8" />
            <path d="M4 5.3v5.4M5.8 3.5C9.5 3.5 12 4.2 12 6.2" />
        </svg>
    ),
    pr: (
        <svg viewBox="0 0 16 16">
            <circle cx="4" cy="3.5" r="1.8" />
            <circle cx="4" cy="12.5" r="1.8" />
            <circle cx="12" cy="12.5" r="1.8" />
            <path d="M4 5.3v5.4M12 10.7V6c0-1.2-.7-2-2-2H8.5M10 2.5 8.5 4 10 5.5" />
        </svg>
    ),
    repo: (
        <svg viewBox="0 0 16 16">
            <path d="M3 13V3.5A1.5 1.5 0 0 1 4.5 2H13v10H4.5A1.5 1.5 0 0 0 3 13.5 1.5 1.5 0 0 0 4.5 15H13" />
        </svg>
    ),
    down: (
        <svg viewBox="0 0 16 16">
            <path d="m4 6 4 4 4-4" />
        </svg>
    ),
};

const rows = [
    ["problem", "Problem"],
    ["contribution", "What I did"],
    ["impact", "Impact"],
];

function OpenSource() {
    const dispatch = useDispatch();
    const { data, activeId } = useSelector((state) => state.openSource);

    return (
        <main className="os">
            <section className="os-hero">
                <div className="os-term"><b>$</b> git log --graph --oneline</div>
                <h1>Open source, <span className="os-grad">in the wild.</span></h1>
                <p className="os-lead">Changes I’ve sent to other people’s projects. Tap one to see the story.</p>
            </section>

            <section className="os-log">
                {data.map((item) => {
                    const merged = item.status === "Merged";
                    const isActive = item.id === activeId;
                    const repo = item.repositoryUrl
                        ? item.repositoryUrl.replace("https://github.com/", "")
                        : item.name;

                    return (
                        <article
                            key={item.id}
                            className={`os-item${merged ? "" : " is-pending"}${isActive ? " is-active" : ""}`}
                        >
                            <div className="os-node">{merged ? icons.merge : icons.pr}</div>

                            <div className="os-box">
                                <button
                                    className="os-head"
                                    aria-expanded={isActive}
                                    aria-controls={`os-${item.id}`}
                                    onClick={() => dispatch(setActiveId(isActive ? null : item.id))}
                                >
                                    <span className="os-title">{item.pullRequestTitle}</span>
                                    <span className="os-status"><i />{item.status}</span>
                                    <span className="os-chev">{icons.down}</span>
                                    <span className="os-meta">
                                        {item.pullRequestNumber && <b>#{item.pullRequestNumber}</b>}
                                        {repo}
                                    </span>
                                </button>

                                <div className="os-fold" id={`os-${item.id}`}>
                                    <div>
                                        <div className="os-body">
                                            <div className="os-rows">
                                                {rows.map(([key, label]) =>
                                                    item[key] && (
                                                        <div key={key} className={`os-row os-row--${key}`}>
                                                            <h4>{label}</h4>
                                                            <p>{item[key]}</p>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {(item.pullRequestUrl || item.repositoryUrl || item.mergeCommitUrl) && (
                                                <div className="os-links">
                                                    {item.pullRequestUrl && (
                                                        <a className="os-btn os-btn--primary" href={item.pullRequestUrl} target="_blank" rel="noopener noreferrer">
                                                            {icons.pr}View pull request
                                                        </a>
                                                    )}
                                                    {item.repositoryUrl && (
                                                        <a className="os-btn" href={item.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                                            {icons.repo}Repository
                                                        </a>
                                                    )}
                                                    {item.mergeCommitUrl && (
                                                        <a className="os-btn" href={item.mergeCommitUrl} target="_blank" rel="noopener noreferrer">
                                                            {icons.merge}Merge commit
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}

export default OpenSource;