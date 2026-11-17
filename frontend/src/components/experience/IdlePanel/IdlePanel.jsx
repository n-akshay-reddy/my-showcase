import "./IdlePanel.css";

// Illustration shown on the right until a highlight is hovered.
export default function IdlePanel() {
    return (
        <div className="exp-idle" aria-hidden="true">
            <svg viewBox="0 0 280 190" fill="none">
                <defs>
                    <linearGradient id="exp-idle-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" style={{ stopColor: "var(--g1)" }} />
                        <stop offset=".55" style={{ stopColor: "var(--g2)" }} />
                        <stop offset="1" style={{ stopColor: "var(--g3)" }} />
                    </linearGradient>
                </defs>
                <ellipse cx="130" cy="176" rx="96" ry="7" style={{ fill: "var(--g3)", opacity: 0.08 }} />
                <rect className="exp-svg-window" x="10" y="14" width="160" height="148" rx="16" />
                <circle cx="26" cy="30" r="3.5" style={{ fill: "var(--g2)" }} />
                <circle cx="37" cy="30" r="3.5" style={{ fill: "var(--g1)" }} />
                <circle cx="48" cy="30" r="3.5" style={{ fill: "var(--g3)" }} />
                <rect className="exp-svg-row" x="22" y="48" width="136" height="32" rx="10" />
                <circle className="exp-svg-line" cx="38" cy="64" r="7" />
                <rect className="exp-svg-line" x="52" y="57" width="70" height="5" rx="2.5" />
                <rect className="exp-svg-line" x="52" y="67" width="46" height="4" rx="2" />
                <rect className="exp-svg-hot" x="22" y="88" width="136" height="32" rx="10" />
                <circle cx="38" cy="104" r="7" fill="url(#exp-idle-gradient)" />
                <rect className="exp-svg-accent" x="52" y="97" width="74" height="5" rx="2.5" />
                <rect className="exp-svg-accent" x="52" y="107" width="50" height="4" rx="2" />
                <rect className="exp-svg-row" x="22" y="128" width="136" height="26" rx="10" />
                <circle className="exp-svg-line" cx="38" cy="141" r="6" />
                <rect className="exp-svg-line" x="52" y="136" width="62" height="5" rx="2.5" />
                <rect className="exp-svg-line" x="52" y="145" width="40" height="4" rx="2" />
                <path d="M158 104h24" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" style={{ stroke: "var(--g3)" }} />
                <circle cx="158" cy="104" r="3" style={{ fill: "var(--g3)" }} />
                <rect className="exp-svg-panel" x="184" y="48" width="88" height="112" rx="14" />
                <circle cx="200" cy="66" r="8" fill="url(#exp-idle-gradient)" />
                <rect className="exp-svg-accent" x="214" y="61" width="44" height="5" rx="2.5" />
                <rect className="exp-svg-line" x="214" y="71" width="30" height="4" rx="2" />
                <rect className="exp-svg-line" x="196" y="90" width="64" height="4" rx="2" />
                <rect className="exp-svg-line" x="196" y="100" width="56" height="4" rx="2" />
                <rect className="exp-svg-line" x="196" y="110" width="60" height="4" rx="2" />
                <rect x="196" y="126" width="64" height="22" rx="8" fill="url(#exp-idle-gradient)" fillOpacity=".16" />
                <rect x="204" y="135" width="40" height="4" rx="2" fill="url(#exp-idle-gradient)" />
                <g className="exp-svg-cursor">
                    <path className="exp-svg-pointer" d="M122 104l0 17 4.6-4 3.2 7.8 3.4-1.4-3.2-7.6 6.2-.4z" />
                </g>
                <path d="M176 24v10M171 29h10" strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--g2)" }} />
                <path d="M6 176v8M2 180h8" strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--g3)" }} />
            </svg>
            <h4>Peek into any project</h4>
            <p>Rest on a card to see the problem, how I solved it and the result.</p>
            <div className="exp-legend">
                <span><i>+</i>New feature</span>
                <span className="is-fix"><i>!</i>Problem solved</span>
            </div>
        </div>
    );
}