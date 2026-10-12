import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import "./NavLogo.css";

const HOLD = 2000;
const FLY = 900;


function useAtTop(threshold = 40) {
    const [top, setTop] = useState(() => window.scrollY <= threshold);
    useEffect(() => {
        const onScroll = () => setTop(window.scrollY <= threshold);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);
    return top;
}

export default function NavLogo({ onDone }) {
    const ref = useRef(null);
    const doneRef = useRef(onDone);

    const theme = useSelector((state) => state.theme.mode);
    const dark = theme === "dark-mode";
    const atTop = useAtTop();

    const [skip] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const [stage, setStage] = useState(skip ? "done" : "enter"); 
    const [from, setFrom] = useState(null);
    const [coverGone, setCoverGone] = useState(skip);

    useEffect(() => {
        if (skip) return;
        let cancelled = false;
        (document.fonts?.ready ?? Promise.resolve()).then(() => {
            if (cancelled || !ref.current) return;
            const r = ref.current.getBoundingClientRect();
            const { innerWidth: vw, innerHeight: vh } = window;
            const scale = Math.min(vw * 0.8, 720) / r.width;
            const dx = vw / 2 - (r.left + r.width / 2);
            const dy = vh / 2 + 100- (r.top + r.height / 2);
            setFrom(`translate(${dx}px, ${dy}px) scale(${scale})`);
        });
        return () => {
            cancelled = true;
        };
    }, [skip]);

    useEffect(() => {
        if (skip) {
            doneRef.current?.();
            return;
        }
        if (!from) return;
        const timers = [
            setTimeout(() => setStage("show"), 50),
            setTimeout(() => setStage("fly"), HOLD),
            setTimeout(() => {
                setStage("done");
                doneRef.current?.();
            }, HOLD + FLY),
        ];
        return () => timers.forEach(clearTimeout);
    }, [skip, from]);

    const inMiddle = stage === "enter" || stage === "show";
    const hidden = stage === "done" && !atTop;

    return (
        <>
            {!coverGone && (
                <div
                    className={`nl-cover ${stage === "done" ? "is-fading" : ""}`}
                    onTransitionEnd={() => stage === "done" && setCoverGone(true)}
                />
            )}

            <Link ref={ref}
                to="/" className={`nl nl--${stage} ${dark ? "nl--dark" : "nl--light"} ${hidden ? "is-hidden" : ""}`}
                style={inMiddle && from ? { transform: from } : undefined}>
                {inMiddle && from && <img className="nl__ghost" src="/ghost/ghost1.gif" alt="" />}
                <span className="nl__bracket nl__open">&lt;</span>
                <span className="nl__name">
                    N Akshay Kumar Reddy
                    <svg className="nl__swash" viewBox="0 0 100 12" preserveAspectRatio="none">
                            <linearGradient id="nl-swash">
                                <stop offset="0" stopColor="var(--nl-a)" />
                                <stop offset="1" stopColor="var(--nl-b)" />
                            </linearGradient>
                        <path d="M1 4 Q50 -2 99 11 Q50 3 1 4 Z" fill="url(#nl-swash)" />
                    </svg>
                </span>
                <span className="nl__bracket nl__close">/&gt;</span>
            </Link>
        </>
    );
}