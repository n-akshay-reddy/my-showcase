import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore ,useDispatch, useSelector } from "react-redux";
import {
    ArrowUp, Check, Circle, Loader2, Maximize2, Minimize2, Minus, Sparkles, Square, X,
} from "lucide-react";

import SreeviRobot from "../SreeviRobot/SreeviRobot";
import { sendSreeviMessage } from "../../../ai/services/sreeviApi";
import { buildContext } from "../../../ai/context/buildContext";
import { createRun, runTurn } from "../../../ai/runner/runTurn";
import { CHAT_CONFIG } from "../../../ai/config/chatConfig";
import { useNavigate } from "react-router-dom";
import {
    clearConversation,
    closeChat,
    selectBusy,
    selectSreevi,
    startTurn,
    turnCancelled,
    turnFailed,
} from "../../../state-management/Sreevi/SreeviSlice";
import "./SreeviChat.css";

const SUGGESTIONS = [
    "Show my LeetCode stats",
    "Navigate to a section",
    "Change theme",
    "Update UI layout",
    "Fetch and show data",
    "Answer questions",
];

function useViewport() {
    const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
        const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", on);
        return () => window.removeEventListener("resize", on);
    }, []);
    return vp;
}

function panelBox(expanded, { w: vw, h: vh }) {
    const small = vw <= 520;
    let w, h, r, b;
    if (expanded) {
        w = small ? vw - 16 : Math.min(880, vw - 48);
        h = small ? vh - 16 : Math.min(720, vh - 48);
        r = (vw - w) / 2;
        b = (vh - h) / 2;
    } else {
        w = small ? vw - 16 : Math.min(400, vw - 32);
        h = small ? Math.min(vh * 0.82, vh - 90) : Math.min(590, vh - 120);
        r = small ? 8 : 24;
        b = small ? 8 : 24;
    }
    return { width: w, height: h, right: r, bottom: b };
}

const friendlyError = (error) =>
    error instanceof TypeError
        ? "Can't reach the server. Is the backend running and is its URL correct?"
        : error?.message || "Sreevi couldn't complete your request.";

/* ───────────── one turn: the visitor's bubble, Sreevi's bubble, the live checklist ───────────── */

function TaskIcon({ status }) {
    if (status === "done") return <Check size={14} />;
    if (status === "running") return <Loader2 size={14} className="sv-spin" />;
    if (status === "failed") return <X size={14} />;
    if (status === "skipped") return <Minus size={14} />;
    return <Circle size={12} />;
}

// pending/running show what is being done; finished tasks show what happened
const taskText = (task) =>
    task.status === "done" || task.status === "skipped" ? task.result || task.label : task.label;

function TurnView({ turn, onLinkClick }) {
    const [showSteps, setShowSteps] = useState(false); // view state only, never stored in Redux

    const running = turn.status === "running";
    const failed = turn.status === "failed";
    const stepCount = turn.tasks.reduce((n, t) => n + t.steps.length, 0);
    const replyText = turn.reply?.text ?? (turn.status === "cancelled" ? "Stopped." : "");

    return (
        <>
            <div className="sv-msg sv-msg--user">
                <div className="sv-msg__bubble">
                    <p>{turn.user.text}</p>
                </div>
            </div>

            {turn.status === "thinking" && (
                <div className="sv-msg sv-msg--agent" role="status" aria-label="Sreevi is working">
                    <div className="sv-msg__bubble sv-typing">
                        <i /><i /><i />
                    </div>
                </div>
            )}

            {replyText && (
                <div className="sv-msg sv-msg--agent">
                    <div className={`sv-msg__bubble ${turn.reply?.isError || failed ? "is-error" : ""}`}>
                        <p>{replyText}</p>

                        {turn.tasks.length > 0 && (
                            <ul className="sv-tasks">
                                {turn.tasks.map((task) => {
                                    // live while running or expanded; otherwise only a failed step stays visible
                                    const steps =
                                        running || showSteps
                                            ? task.steps
                                            : task.steps.filter((s) => s.status === "failed");
                                    const link =
                                        task.link && (task.status === "running" || task.status === "done")
                                            ? task.link
                                            : null;

                                    return (
                                        <li key={task.id} className={`sv-task sv-task--${task.status}`}>
                                            <span className="sv-task__icon">
                                                <TaskIcon status={task.status} />
                                            </span>
                                            <div className="sv-task__body">
                                                <span className="sv-task__text">{taskText(task)}</span>

                                                {task.status === "running" && task.result && (
                                                    <span className="sv-task__note">{task.result}</span>
                                                )}

                                                {link && (
                                                    <a
                                                        className="sv-msg__link"
                                                        href={link.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={onLinkClick}
                                                    >
                                                        {link.label}
                                                    </a>
                                                )}

                                                {steps.length > 0 && (
                                                    <ul className="sv-steps">
                                                        {steps.map((step) => (
                                                            <li key={step.id} className={`sv-step sv-step--${step.status}`}>
                                                                <span className="sv-task__icon">
                                                                    <TaskIcon status={step.status} />
                                                                </span>
                                                                <span>
                                                                    {step.label}
                                                                    {step.detail && (
                                                                        <span className="sv-task__note"> · {step.detail}</span>
                                                                    )}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {failed && !turn.reply?.isError && turn.error && (
                            <p className="sv-turn__error">{turn.error.message}</p>
                        )}

                        {stepCount > 0 && !running && (
                            <button type="button" className="sv-steps-btn" onClick={() => setShowSteps((v) => !v)}>
                                {showSteps ? "Hide steps" : `Show steps (${stepCount})`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

/* ───────────── the chat panel ───────────── */

function SreeviChat() {
    const dispatch = useDispatch();
    const store = useStore();
    const navigate = useNavigate();
    const { isOpen, turns } = useSelector(selectSreevi);
    const busy = useSelector(selectBusy);

    const [draft, setDraft] = useState("");
    const [expanded, setExpanded] = useState(false);
    const viewport = useViewport();

    const panelRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const runRef = useRef(null); // the turn in flight: { signal, abort, skipCountdown }

    const canSend = draft.trim() && !busy;

    // A closed panel must not keep focus: `inert` handles that, `aria-hidden` doesn't.
    useEffect(() => {
        if (panelRef.current) panelRef.current.inert = !isOpen;
    }, [isOpen]);

    const minimize = () => {
        setExpanded(false);
        dispatch(closeChat()); // the history is kept
    };

    // X: stop anything running and wipe the chat
    const endChat = () => {
        runRef.current?.abort();
        dispatch(clearConversation());
        setDraft("");
        minimize();
    };

    // Stop button: cancel the turn in flight. Finished tasks stay as they are.
    const stop = () => {
        runRef.current?.abort();
        const last = store.getState().sreevi.turns.at(-1);
        if (last) dispatch(turnCancelled({ turnId: last.id }));
    };

    // Focus on open; Esc collapses first, then closes.
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => inputRef.current?.focus(), 250);
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            expanded ? setExpanded(false) : minimize();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            clearTimeout(t);
            window.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, expanded]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [turns]);

    useEffect(() => {
        if (isOpen && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [isOpen]);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "24px";
        el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
    }, [draft]);

    // Don't leave a run going if the chat unmounts
    useEffect(() => () => runRef.current?.abort(), []);

    const send = async (text) => {
        const value = text.trim();
        if (!value || busy) return;

        const before = store.getState().sreevi;
        const epoch = before.epoch;                    // which chat this request belongs to
        const context = buildContext(before.turns);    // built BEFORE the new turn is added

        const started = startTurn(value);
        dispatch(started);
        setDraft("");

        const turnId = started.payload.id;
        const run = createRun();
        runRef.current = run;

        const stale = () => run.signal.aborted || store.getState().sreevi.epoch !== epoch;

        try {
            const decision = await sendSreeviMessage(started.payload.text, context, run.signal);
            if (stale()) return; // Stop or X while waiting: drop the reply and run nothing

            await runTurn({
                turnId,
                decision,
                run,
                epoch,
                dispatch,
                getState: store.getState,
                navigate,
            });
            console.log(store.getState().sreevi);
        } catch (error) {
            console.error("Sreevi request failed:", error);
            if (stale()) return;
            dispatch(turnFailed({ turnId, message: friendlyError(error) }));
        } finally {
            if (runRef.current === run) runRef.current = null;
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send(draft);
        }
    };

    // Rendered into <body> so no parent z-index / transform can cover or clip it.
    return createPortal(
        <>
            <div
                className={`sv-backdrop ${isOpen && expanded ? "is-on" : ""}`}
                onClick={() => setExpanded(false)}
            />

            <section
                className={`sv-chat ${isOpen ? "is-open" : ""} ${expanded ? "is-expanded" : ""}`}
                role="dialog"
                aria-label="Chat with Sreevi"
                ref={panelRef}
                style={panelBox(expanded, viewport)}
            >
                <header className="sv-chat__head">
                    <SreeviRobot className="sv-chat__avatar" status={busy ? "working" : "idle"} />

                    <div className="sv-chat__who">
                        <div className="sv-chat__name">
                            <strong>Sreevi</strong>
                            <span className="sv-chat__tag">AI Portfolio Agent</span>
                        </div>
                        <span className="sv-chat__state">
                            <i className={busy ? "is-busy" : ""} />
                            {busy ? "Working on it" : "Online"}
                        </span>
                    </div>

                    <div className="sv-chat__actions">
                        <button
                            type="button"
                            title={expanded ? "Exit full view" : "Expand"}
                            aria-label={expanded ? "Exit full view" : "Expand chat"}
                            onClick={() => setExpanded((v) => !v)}
                        >
                            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button type="button" title="Minimize" aria-label="Minimize chat" onClick={minimize}>
                            <Minus size={16} />
                        </button>
                        <button type="button" title="Close and clear" aria-label="Close chat" onClick={endChat}>
                            <X size={16} />
                        </button>
                    </div>
                </header>

                <div className="sv-chat__body" ref={listRef} role="log" aria-live="polite">
                    <div className="sv-msg sv-msg--agent">
                        <div className="sv-msg__bubble">
                            <p>Hi Akshay! 👋</p>
                            <p>I'm Sreevi, your AI portfolio agent. What can I do for you?</p>
                        </div>
                    </div>

                    {turns.length === 0 && (
                        <div className="sv-chips">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} type="button" onClick={() => send(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {turns.map((turn) => (
                        <TurnView
                            key={turn.id}
                            turn={turn}
                            onLinkClick={() => runRef.current?.skipCountdown()}
                        />
                    ))}
                </div>

                <form
                    className="sv-chat__composer"
                    onSubmit={(e) => {
                        e.preventDefault();
                        send(draft);
                    }}
                >
                    <span className="sv-chat__spark">
                        <Sparkles size={20} />
                    </span>
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={draft}
                        placeholder="Ask Sreevi anything..."
                        aria-label="Message Sreevi"
                        maxLength={CHAT_CONFIG.maxMessageChars}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    {busy ? (
                        <button
                            type="button"
                            className="sv-chat__send is-stop"
                            aria-label="Stop"
                            title="Stop"
                            onClick={stop}
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    ) : (
                        <button type="submit" className="sv-chat__send" aria-label="Send message" disabled={!canSend}>
                            <ArrowUp size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </form>
            </section>
        </>,
        document.body
    );
}

export default SreeviChat;