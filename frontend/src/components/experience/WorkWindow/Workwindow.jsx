import "./WorkWindow.css";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IdlePanel from "../IdlePanel/IdlePanel";
import { getPeriod, getSortedHighlights, getTenure } from "../../../util/experienceutils";

const TABS = [
    { type: "all", label: "All" },
    { type: "fix", label: "Problems solved" },
    { type: "feature", label: "Features built" },
];

// Must match the translateX on .exp-card:hover in WorkWindow.css.
const CARD_SHIFT = 8;

// Touch screens and narrow windows get a bottom sheet instead of the hover popup.
const isSheetMode = () => !window.matchMedia("(hover: hover)").matches || window.innerWidth <= 960;

function groupByArea(highlights) {
    const groups = [];
    highlights.forEach((highlight) => {
        let group = groups.find((item) => item.area === highlight.area);
        if (!group) {
            group = { area: highlight.area, items: [] };
            groups.push(group);
        }
        group.items.push(highlight);
    });
    return groups;
}

export default function WorkWindow({ company, onClose }) {
    // Local UI state only. Which company is open lives in Redux.
    const [filter, setFilter] = useState("all");
    const [activeId, setActiveId] = useState(null); // highlight shown in the popup
    const [pinned, setPinned] = useState(false);
    const [sheet, setSheet] = useState(isSheetMode);

    const bodyRef = useRef(null);
    const gridRef = useRef(null);
    const popupRef = useRef(null);
    const beamRef = useRef(null);
    const innerRef = useRef(null);
    const closeRef = useRef(null);
    const cardRefs = useRef({});
    const openTimer = useRef(null);
    const closeTimer = useRef(null);
    const trackTimer = useRef(null);

    const highlights = useMemo(
        () => getSortedHighlights(company).filter((item) => filter === "all" || item.type === filter),
        [company, filter]
    );
    const groups = useMemo(() => groupByArea(highlights), [highlights]);
    const active = highlights.find((item) => item.id === activeId) ?? null;
    const activeIsFix = active?.type === "fix";

    const hide = useCallback(() => {
        clearTimeout(openTimer.current);
        clearTimeout(closeTimer.current);
        setPinned(false);
        setActiveId(null);
    }, []);

    function show(id) {
        clearTimeout(closeTimer.current);
        setActiveId(id);
    }

    // After a short rest outside the cards, beam and popup, close it (unless pinned).
    function scheduleHide() {
        if (pinned || sheet) return;
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(hide, 300);
    }

    // Puts the popup beside the card, points its notch at the card and draws the beam between them.
    const placePopup = useCallback((card) => {
        const body = bodyRef.current;
        const popup = popupRef.current;
        const beam = beamRef.current;
        const bodyBox = body.getBoundingClientRect();

        if (sheet) {
            body.style.setProperty("--max-h", `${Math.round(bodyBox.height * 0.8)}px`);
            return;
        }

        // Right edge of the card once it has finished its hover nudge.
        const cardRight = card.offsetLeft + card.offsetWidth + CARD_SHIFT;
        const width = Math.max(320, Math.min(440, bodyBox.width - cardRight - 60));
        const popupLeft = bodyBox.width - width - 28;
        body.style.setProperty("--max-h", `${Math.round(bodyBox.height - 30)}px`);
        body.style.setProperty("--popup-w", `${width}px`);
        popup.style.left = `${popupLeft}px`;

        const cardBox = card.getBoundingClientRect();
        const popupHeight = popup.offsetHeight;
        const cardMiddle = cardBox.top - bodyBox.top + cardBox.height / 2;
        const top = Math.max(14, Math.min(cardMiddle - popupHeight / 2, bodyBox.height - popupHeight - 14));
        const notchY = Math.max(32, Math.min(cardMiddle - top, popupHeight - 32));
        popup.style.top = `${top}px`;
        popup.style.setProperty("--notch-y", `${notchY}px`);

        if (beam) {
            beam.style.left = `${cardRight}px`;
            beam.style.width = `${Math.max(0, popupLeft - cardRight - 6)}px`;
            beam.style.top = `${top + notchY - 22}px`;
        }
    }, [sheet]);

    useLayoutEffect(() => {
        const card = cardRefs.current[activeId];
        if (!activeId || !card || !popupRef.current) return;
        innerRef.current.scrollTop = 0;
        placePopup(card);
    }, [activeId, placePopup]);

    useEffect(() => {
        const onResize = () => {
            hide();
            setSheet(isSheetMode());
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [hide]);

    // Esc closes the popup first, then the window.
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            if (activeId) hide();
            else onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [activeId, hide, onClose]);

    // Lock page scroll, move focus into the window, and give focus back on close.
    useEffect(() => {
        const opener = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus({ preventScroll: true });
        return () => {
            document.body.style.overflow = previousOverflow;
            opener?.focus?.({ preventScroll: true });
            clearTimeout(openTimer.current);
            clearTimeout(closeTimer.current);
            clearTimeout(trackTimer.current);
        };
    }, []);

    // Hover with intent: rest on a card to open it.
    function handleCardEnter(id) {
        if (sheet) return;
        clearTimeout(closeTimer.current);
        if (id === activeId) return;
        clearTimeout(openTimer.current);
        openTimer.current = setTimeout(() => show(id), activeId ? 60 : 150);
    }

    function handleCardLeave() {
        clearTimeout(openTimer.current);
        if (activeId) scheduleHide();
    }

    // Click pins the popup; click the same card again to unpin.
    function handleCardClick(id) {
        clearTimeout(openTimer.current);
        if (sheet) {
            show(id);
            return;
        }
        if (pinned && activeId === id) {
            setPinned(false);
            return;
        }
        show(id);
        setPinned(true);
    }

    function handleCardFocus(event, id) {
        if (!sheet && event.currentTarget.matches(":focus-visible")) show(id);
    }

    function handleCardBlur(event) {
        if (sheet || pinned || popupRef.current?.matches(":hover")) return;
        if (event.relatedTarget?.closest?.(".exp-card, .exp-popup")) return;
        scheduleHide();
    }

    function handleGridKeyDown(event) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const current = event.target.closest(".exp-card");
        if (!current) return;
        const cards = [...gridRef.current.querySelectorAll(".exp-card")];
        const next = cards[cards.indexOf(current) + (event.key === "ArrowDown" ? 1 : -1)];
        if (!next) return;
        event.preventDefault();
        next.focus();
    }

    // Keep the popup and beam beside the card while the list scrolls; hide them once the card scrolls away.
    function handleGridScroll() {
        const card = cardRefs.current[activeId];
        if (!card || sheet) return;
        const cardBox = card.getBoundingClientRect();
        const gridBox = gridRef.current.getBoundingClientRect();
        if (cardBox.bottom < gridBox.top + 56 || cardBox.top > gridBox.bottom - 24) {
            hide();
            return;
        }
        popupRef.current.dataset.tracking = "true";
        if (beamRef.current) beamRef.current.dataset.tracking = "true";
        placePopup(card);
        clearTimeout(trackTimer.current);
        trackTimer.current = setTimeout(() => {
            if (popupRef.current) delete popupRef.current.dataset.tracking;
            if (beamRef.current) delete beamRef.current.dataset.tracking;
        }, 140);
    }

    function handleBodyWheel(event) {
        if (sheet || event.target.closest(".exp-grid, .exp-popup")) return;
        gridRef.current.scrollTop += event.deltaY;
    }

    function handleBodyClick(event) {
        if (activeId && !event.target.closest(".exp-card, .exp-popup")) hide();
    }

    function handleTab(type) {
        hide();
        setFilter(type);
        gridRef.current.scrollTop = 0;
    }

    function handlePopupMove(event) {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--gx", `${event.clientX - box.left}px`);
        event.currentTarget.style.setProperty("--gy", `${event.clientY - box.top}px`);
    }

    // Rendered into <body> so the navbar and floating buttons can never sit on top of the window or its close button.
    // The .exp-page wrapper keeps the page's colour variables available.
    return createPortal(
        <div className="exp-page">
            <div className="exp-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
                <div className="exp-window" role="dialog" aria-modal="true" aria-labelledby="exp-window-title">
                    <div className="exp-window-head">
                        <div className="exp-mono">{company.mono}</div>
                        <div>
                            <h2 id="exp-window-title">{company.company}</h2>
                            <p className="exp-window-role">{company.role}</p>
                            <p className="exp-window-meta">{getPeriod(company)} · {getTenure(company)}</p>
                        </div>
                        <button ref={closeRef} type="button" className="exp-close" aria-label="Close" onClick={onClose}>
                            <X />
                        </button>
                    </div>

                    <div className="exp-tools">
                        <div className="exp-tabs">
                            {TABS.map((tab) => (
                                <button key={tab.type} type="button" aria-pressed={filter === tab.type} onClick={() => handleTab(tab.type)}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <span className="exp-hint">
                            {sheet ? "Tap a card to see the details" : "Hover a card to peek inside · click to pin"}
                        </span>
                    </div>

                    <div
                        ref={bodyRef}
                        className={`exp-body${sheet ? " is-sheet" : ""}${active ? " is-open" : ""}`}
                        onClick={handleBodyClick}
                        onWheel={handleBodyWheel}
                    >
                        <div
                            ref={gridRef}
                            className={`exp-grid${active ? " is-dimmed" : ""}`}
                            onScroll={handleGridScroll}
                            onKeyDown={handleGridKeyDown}
                        >
                            {groups.map((group) => (
                                <section key={group.area}>
                                    <h3 className="exp-section-title"><span>{group.area}</span><em>{group.items.length}</em></h3>
                                    <div className="exp-list">
                                        {group.items.map((item) => (
                                            <button
                                                key={item.id}
                                                ref={(element) => { cardRefs.current[item.id] = element; }}
                                                type="button"
                                                className={`exp-card${item.type === "fix" ? " is-fix" : ""}${item.id === activeId ? " is-active" : ""}`}
                                                style={{ "--n": Math.min(highlights.indexOf(item), 14) }}
                                                onMouseEnter={() => handleCardEnter(item.id)}
                                                onMouseLeave={handleCardLeave}
                                                onClick={() => handleCardClick(item.id)}
                                                onFocus={(event) => handleCardFocus(event, item.id)}
                                                onBlur={handleCardBlur}
                                            >
                                                <div className="exp-icon">{item.type === "fix" ? "!" : "+"}</div>
                                                <div className="exp-card-text">
                                                    <b>{item.title}</b>
                                                    <span className="exp-card-note">{item.note}</span>
                                                </div>
                                                <span className="exp-chevron" aria-hidden="true">›</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <IdlePanel />

                        {active && sheet && <div className="exp-sheet-backdrop" />}

                        {/* animated dashed line from the card to the popup */}
                        {active && !sheet && (
                            <div
                                ref={beamRef}
                                className={`exp-beam${activeIsFix ? " is-fix" : ""}`}
                                aria-hidden="true"
                                onMouseEnter={() => clearTimeout(closeTimer.current)}
                                onMouseLeave={scheduleHide}
                            >
                                <i />
                            </div>
                        )}

                        {active && (
                            <aside
                                ref={popupRef}
                                className={`exp-popup${activeIsFix ? " is-fix" : ""}${pinned ? " is-pinned" : ""}`}
                                aria-label="Highlight details"
                                onMouseEnter={() => clearTimeout(closeTimer.current)}
                                onMouseLeave={scheduleHide}
                            >
                                <span className="exp-notch" />
                                <button type="button" className="exp-popup-close" aria-label="Close details" onClick={hide}>
                                    <X />
                                </button>
                                <div ref={innerRef} className="exp-popup-inner" onMouseMove={handlePopupMove}>
                                    <div className="exp-popup-content" key={active.id}>
                                        <div className="exp-popup-head">
                                            <div className="exp-icon">{activeIsFix ? "!" : "+"}</div>
                                            <div>
                                                <span className="exp-eyebrow">{activeIsFix ? "Problem solved" : "New feature"}</span>
                                                <span className="exp-area">{active.area}</span>
                                            </div>
                                            <span className="exp-pinned-badge">Pinned</span>
                                        </div>
                                        <h3 style={{ "--i": 0 }}>{active.title}</h3>
                                        <p className="exp-popup-note" style={{ "--i": 1 }}>{active.note}</p>
                                        <div className="exp-steps">
                                            <div className="exp-step" style={{ "--i": 2 }}>
                                                <span className="exp-label">{activeIsFix ? "The issue" : "The need"}</span>
                                                <p>{active.challenge}</p>
                                            </div>
                                            <div className="exp-step" style={{ "--i": 3 }}>
                                                <span className="exp-label">{activeIsFix ? "How I fixed it" : "How I built it"}</span>
                                                <p>{active.approach}</p>
                                            </div>
                                        </div>
                                        <div className="exp-result" style={{ "--i": 4 }}>
                                            <span className="exp-label">The result</span>
                                            <p>{active.outcome}</p>
                                        </div>
                                        <div className="exp-chips">
                                            {active.tech.map((tech, index) => <span key={tech} style={{ "--i": 5 + index }}>{tech}</span>)}
                                        </div>
                                        <p className="exp-popup-foot" style={{ "--i": 5 + active.tech.length }}>
                                            <span className="when-hover">Click the card to keep this open</span>
                                            <span className="when-pinned">Pinned · click outside or press Esc to close</span>
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}