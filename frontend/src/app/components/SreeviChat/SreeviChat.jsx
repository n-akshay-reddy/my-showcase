import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUp, Maximize2, Minimize2, Minus, Sparkles, X } from "lucide-react";

import SreeviRobot from "../SreeviRobot/SreeviRobot";
import { sendSreeviMessage } from "../../../ai/services/sreeviApi";
import { useNavigate } from "react-router-dom";
import { executeFrontendTool } from "../../../ai/executor/executeFrontendTool";
import {
    closeChat,
    messageReceived,
    startWorking,
    selectSreevi,
    SREEVI_STATUS,
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

// The API may return a string or an object; the UI always needs text.
const toText = (data) =>
    typeof data === "string" ? data : data?.text ?? data?.message ?? JSON.stringify(data);

function SreeviChat() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isOpen, status } = useSelector(selectSreevi);

    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [typing, setTyping] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const viewport = useViewport();

    const panelRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const busy = typing || status === SREEVI_STATUS.WORKING;
    const canSend = draft.trim() && !busy;

    // A closed panel must not keep focus: `inert` handles that, `aria-hidden` doesn't.
    useEffect(() => {
        if (panelRef.current) panelRef.current.inert = !isOpen;
    }, [isOpen]);

    const minimize = () => {
        setExpanded(false);
        dispatch(closeChat());
    };

    const endChat = () => {
        setMessages([]);
        setDraft("");
        minimize();
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
    }, [messages, busy]);

    useEffect(() => {
        if (isOpen && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [isOpen]);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "24px";
        el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
    }, [draft]);

    const push = (role, text, error) =>
        setMessages((m) => [...m, { id: crypto.randomUUID(), role, text, error }]);

    const send = async (text) => {
        const value = text.trim();
        if (!value || busy) return;

        push("user", value);
        setDraft("");
        setTyping(true);
        dispatch(startWorking("Thinking")); // launcher shows "Working"

        try {
            const decision = await sendSreeviMessage(value);
            let reply = toText(decision);
            let failed = false;
            if (decision?.type === "execute" && decision.tool?.runsOn === "frontend") {
                const result = executeFrontendTool(decision.tool, { navigate });

                // Failure or "already done": show the real result instead of Gemini's line
                if (!result.ok || result.changed === false) {
                    reply = result.message;
                    failed = !result.ok;
                }
            }

            push("agent", reply,failed);
            // Chat open -> back to idle. Minimized -> "Result ready" + badge + preview.
            dispatch(messageReceived(reply.length > 48 ? `${reply.slice(0, 48)}…` : reply));
        } catch (error) {
            const msg =
                error instanceof TypeError
                    ? "Can't reach the server. Is the backend running and is its URL correct?"
                    : error.message || "Sreevi couldn't complete your request.";
            push("agent", msg, true);
            dispatch(messageReceived("Something went wrong"));
        } finally {
            setTyping(false);
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

                    {messages.length === 0 && (
                        <div className="sv-chips">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} type="button" onClick={() => send(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {messages.map((m) => (
                        <div key={m.id} className={`sv-msg sv-msg--${m.role}`}>
                            <div className={`sv-msg__bubble ${m.error ? "is-error" : ""}`}>
                                <p>{m.text}</p>
                            </div>
                        </div>
                    ))}

                    {busy && (
                        <div className="sv-msg sv-msg--agent" role="status" aria-label="Sreevi is working">
                            <div className="sv-msg__bubble sv-typing">
                                <i /><i /><i />
                            </div>
                        </div>
                    )}
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
                        maxLength={1000}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <button type="submit" className="sv-chat__send" aria-label="Send message" disabled={!canSend}>
                        <ArrowUp size={20} strokeWidth={2.5} />
                    </button>
                </form>
            </section>
        </>,
        document.body
    );
}

export default SreeviChat;