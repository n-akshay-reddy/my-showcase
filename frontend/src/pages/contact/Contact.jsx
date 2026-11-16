import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Bot, Check, Copy, Download, Eye, Mail, MapPin, Send, Sparkles, Square, Wand2, X } from "lucide-react";
import {
    CONTACT_EMAIL, EMAIL_RE, LOCATION, LOCATION_NOTE, PROMPT_MAX, RESUME_FILE, RESUME_URL, TOPICS,
} from "./contactConfig";
import "./Contact.css";

import { composeWithSreevi } from "../../ai/services/sreeviApi";

/** How long after Sreevi finishes a draft we show the stronger "you'll lose it" warning. */
const FRESH_DRAFT_MS = 5000;

const fill = (text, name) => text.replaceAll("{name}", name.trim() || "[Your name]");

const buildPayload = ({ channel, topic, name, email, prompt, subject, body }) => ({
    channel,
    topic,
    sender: { name: name.trim() || null, email: email?.trim() || null },
    prompt: prompt.trim(),
    current: body.trim()
        ? { subject: channel === "gmail" ? subject.trim() || null : null, body: body.trim() }
        : null,
});

/** Copies text to the clipboard. Resolves to true when it worked. */
function useCopy() {
    const [copied, setCopied] = useState(false);
    const timer = useRef(0);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            return false;
        }
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
        return true;
    }, []);

    return [copied, copy];
}

/**
 * Owns one compose request at a time.
 * - run(payload, onDone): starts a request (cancels any previous one)
 * - stop(): aborts the in-flight request
 * Aborts are silent. Real failures set `error`.
 * It does NOT abort on unmount; callers decide that.
 */
function useCompose() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const ctl = useRef(null);

    const stop = useCallback(() => {
        ctl.current?.abort();
        ctl.current = null;
        setLoading(false);
    }, []);

    const run = useCallback(async (payload, onDone) => {
        ctl.current?.abort();
        const c = new AbortController();
        ctl.current = c;
        setLoading(true);
        setError("");
        try {
            const data = await composeWithSreevi(payload, c.signal);
            if (ctl.current !== c) return; // stopped or replaced
            if (!data?.body) throw new Error("Sreevi didn't return a message. Please try again.");
            onDone(data);
        } catch (e) {
            if (e?.name === "AbortError" || ctl.current !== c) return;
            setError(e?.message || "Sreevi couldn't write the message. Please try again.");
        } finally {
            if (ctl.current === c) {
                ctl.current = null;
                setLoading(false);
            }
        }
    }, []);

    return { loading, error, run, stop };
}

const MAX_TEXTAREA_H = 106;

const grow = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.max(40, Math.min(el.scrollHeight, MAX_TEXTAREA_H))}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_H ? "auto" : "hidden";
};

function Composer({ id, value, onChange, disabled, onWrite, onStop, loading = false, error = "" }) {
    const over = value.length > PROMPT_MAX;
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) grow(ref.current);
    }, [value]);

    const note = error
        || (over && `That’s over ${PROMPT_MAX} characters. Please shorten it.`)
        || (loading && "Sreevi is writing…")
        || "Typing is optional. Leave it empty and Sreevi will still write one for you.";

    return (
        <>
            <div className="ct-sv">
                <div className={`ct-comp${over ? " is-bad" : ""}`}>
                    <Bot size={18} />
                    <textarea
                        id={id}
                        ref={ref}
                        rows={1}
                        value={value}
                        disabled={disabled || loading}
                        placeholder="Tell Sreevi what to write…"
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (!disabled && !over && !loading) onWrite();
                            }
                        }}
                    />
                </div>
                {loading ? (
                    <button type="button" className="ct-btn ct-gen ct-stop" onClick={onStop}>
                        <span className="ct-stop-ic" aria-hidden="true"><Square size={8} fill="currentColor" /></span>Stop
                    </button>
                ) : (
                    <button type="button" className="ct-btn ct-btn--pri ct-gen" disabled={disabled || over} onClick={onWrite}>
                        <Wand2 size={16} />Ask Sreevi
                    </button>
                )}
            </div>
            <p className={`ct-svnote${over || error ? " is-bad" : ""}`} role="status">{note}</p>
        </>
    );
}

function SendCard() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [touched, setTouched] = useState(false);
    const [msg, setMsg] = useState("");
    const [prompt, setPrompt] = useState("");
    // No abort on unmount: generation keeps running if the visitor switches pages.
    const { loading, error, run, stop } = useCompose();

    const valid = EMAIL_RE.test(email.trim());
    const bad = (touched || valid) && email.trim() !== "" && !valid;

    const write = () =>
        run(
            buildPayload({ channel: "message", topic: "general", name, email, prompt, subject: "", body: msg }),
            (data) => {
                setMsg(data.body);
                setPrompt("");
            }
        );

    return (
        <section className="ct-card ct-card--main">
            <h2 className="ct-ct"><Send size={18} />Send a message</h2>

            <div className="ct-f2">
                <div>
                    <label htmlFor="ct-name">Name <span className="ct-opt-l">(optional)</span></label>
                    <input id="ct-name" value={name} placeholder="Jane Smith" autoComplete="name" onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="ct-email">Your email</label>
                    <input
                        id="ct-email" type="email" inputMode="email" value={email} placeholder="you@example.com" autoComplete="email"
                        data-state={valid ? "ok" : bad ? "bad" : undefined}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (e.target.value.includes("@")) setTouched(true);
                        }}
                        onBlur={() => setTouched(true)}
                    />
                </div>
            </div>
            <p className="ct-hintline" aria-live="polite">{bad ? "Please enter a valid email, like name@example.com" : ""}</p>

            <label htmlFor="ct-msg">Message</label>
            <textarea
                id="ct-msg" className="ct-message" value={msg} disabled={!valid || loading}
                placeholder={valid ? "Write your message here…" : "Enter a valid email above to start typing"}
                onChange={(e) => setMsg(e.target.value)}
            />

            <label htmlFor="ct-prompt">Let Sreevi write it</label>
            <Composer
                id="ct-prompt" value={prompt} onChange={setPrompt} disabled={!valid}
                loading={loading} error={error} onWrite={write} onStop={stop}
            />

            <div className="ct-sendrow">
                {/* Placeholder: wire this to your send endpoint. */}
                <button type="button" className="ct-btn ct-btn--pri" disabled={!valid || !msg.trim() || loading} onClick={() => setMsg("")}>
                    Send message<ArrowRight size={16} />
                </button>
            </div>
        </section>
    );
}

function MailCard({ onPick }) {
    const [open, setOpen] = useState(false);
    const [copied, copy] = useCopy();
    const [touch] = useState(() => window.matchMedia("(hover: none)").matches);

    return (
        <div
            className={`ct-ch${open ? " is-open" : ""}`}
            tabIndex={0}
            onMouseEnter={() => !touch && setOpen(true)}
            onMouseLeave={() => !touch && setOpen(false)}
            onClick={(e) => touch && !e.target.closest("button") && setOpen((o) => !o)}
            onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setOpen((o) => !o);
                }
            }}
        >
            <div className="ct-ch-hd">
                <span className="ct-ic"><Mail size={17} /></span>
                <div>
                    <h2>Email</h2>
                    <small>{CONTACT_EMAIL}</small>
                </div>
                <button type="button" className={`ct-btn ct-copy${copied ? " is-done" : ""}`} onClick={() => copy(CONTACT_EMAIL)}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}
                </button>
            </div>
            <div className="ct-tag">Write me a mail</div>
            <p className="ct-sub">Pick a topic and I’ll draft the first version for you.</p>
            <div className="ct-slot">
                <div className="ct-hint"><ArrowRight size={15} />{touch ? "Tap to choose a topic" : "Hover to choose a topic"}</div>
                <div className="ct-opts">
                    <span className="ct-lbl">What would you like to talk about?</span>
                    {TOPICS.map((t) => (
                        <button key={t.id} type="button" className="ct-opt" onClick={() => onPick(t.id)}>{t.label}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Confirmation sheets shown when the visitor tries to close the modal.
 * - writing: Sreevi is still generating.
 * - fresh:   Sreevi finished less than FRESH_DRAFT_MS ago. Shown once per draft, then never again.
 * After FRESH_DRAFT_MS the modal closes without asking.
 */
const SHEETS = {
    writing: {
        Icon: Bot,
        tone: "busy",
        title: "Sreevi is still writing",
        text: "If you close now, the draft in progress will be cancelled and discarded.",
        keep: "Keep writing",
        leave: "Stop & close",
    },
    fresh: {
        Icon: Sparkles,
        tone: "glow",
        title: "Sreevi just wrote this for you",
        text: "You haven’t had time to read it yet, and it hasn’t been copied or sent. Closing now will lose it.",
        keep: "Keep reading",
        leave: "Discard & close",
        canCopy: true,
    },
};

/** In-modal confirmation sheet (replaces window.confirm). */
function ConfirmSheet({ mode, onKeep, onCopy, onLeave }) {
    const { Icon, tone, title, text, keep, leave, canCopy } = SHEETS[mode];
    return (
        <div className="ct-cf" onMouseDown={(e) => e.target === e.currentTarget && onKeep()}>
            <div className="ct-cf-card" role="alertdialog" aria-modal="true" aria-labelledby="ct-cf-t" aria-describedby="ct-cf-d">
                <span className={`ct-cf-ic is-${tone}`} aria-hidden="true"><Icon size={20} /></span>
                <h4 id="ct-cf-t">{title}</h4>
                <p id="ct-cf-d">{text}</p>
                <div className="ct-cf-acts">
                    <button type="button" className="ct-btn ct-btn--pri" autoFocus onClick={onKeep}>{keep}</button>
                    {canCopy && (
                        <button type="button" className="ct-btn" onClick={onCopy}><Copy size={15} />Copy &amp; close</button>
                    )}
                    <button type="button" className="ct-btn ct-btn--danger" onClick={onLeave}>{leave}</button>
                </div>
            </div>
        </div>
    );
}

function Modal({ initial, onClose }) {
    const first = TOPICS.find((t) => t.id === initial);
    const [topic, setTopic] = useState(first);
    const [name, setName] = useState("");
    const [subject, setSubject] = useState(first.subject);
    const [body, setBody] = useState(fill(first.body, ""));
    const [prompt, setPrompt] = useState("");
    const [copied, copy] = useCopy();
    const [sheet, setSheet] = useState(null); // null | "writing" | "fresh"
    const [hasDraft, setHasDraft] = useState(false);
    const { loading, error, run, stop } = useCompose();

    const [showX, setShowX] = useState(true);
    const lastY = useRef(0);
    const wroteAt = useRef(0);
    const warned = useRef(false); // the fresh-draft warning is shown once per draft
    const scrollRef = useRef(null);
    const xRef = useRef(null);

    const onScroll = (e) => {
        const y = e.currentTarget.scrollTop;
        setShowX(y < 40 || y < lastY.current);
        lastY.current = y;
    };

    const fullDraft = `To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`;

    // Every way of closing (X, Escape, backdrop) goes through here.
    const requestClose = () => {
        if (loading) return setSheet("writing");
        if (hasDraft && !warned.current && Date.now() - wroteAt.current < FRESH_DRAFT_MS) {
            warned.current = true;
            return setSheet("fresh");
        }
        onClose();
    };

    // Escape closes the sheet first, then the modal.
    const escRef = useRef();
    escRef.current = () => (sheet ? setSheet(null) : requestClose());

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && escRef.current();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, []);

    // Nothing from this modal may outlive it. State is local, so reopening starts clean.
    useEffect(() => stop, [stop]);

    // If Sreevi finishes while the "still writing" sheet is open, there is nothing left to confirm.
    useEffect(() => {
        if (!loading) setSheet((s) => (s === "writing" ? null : s));
    }, [loading]);

    // While a sheet is open: lock the content behind it, then give focus back afterwards.
    useEffect(() => {
        if (!sheet) return;
        const prev = document.activeElement;
        const locked = [scrollRef.current, xRef.current];
        locked.forEach((el) => el?.setAttribute("inert", ""));
        return () => {
            locked.forEach((el) => el?.removeAttribute("inert"));
            if (prev?.isConnected) prev.focus();
        };
    }, [sheet]);

    const pick = (t) => {
        stop();
        setHasDraft(false);
        setTopic(t);
        setSubject(t.subject);
        setBody(fill(t.body, name));
    };

    // The body follows the name only while the visitor hasn't edited it.
    const onName = (v) => {
        setName(v);
        setBody((b) => (b === fill(topic.body, name) ? fill(topic.body, v) : b));
    };

    const write = () =>
        run(
            buildPayload({ channel: "gmail", topic: topic.id, name, email: "", prompt, subject, body }),
            (data) => {
                if (data.subject) setSubject(data.subject);
                setBody(data.body);
                setPrompt("");
                wroteAt.current = Date.now();
                warned.current = false;
                setHasDraft(true);
            }
        );

    // Links can't be disabled, so block them while Sreevi is writing.
    const onAction = (e) => (loading ? e.preventDefault() : setHasDraft(false));

    const copyDraft = async () => {
        if (await copy(fullDraft)) setHasDraft(false);
    };

    const copyAndClose = async () => {
        if (await copy(fullDraft)) onClose();
    };

    const to = encodeURIComponent(CONTACT_EMAIL);
    const su = encodeURIComponent(subject);
    const bd = encodeURIComponent(body);

    return createPortal(
        <div className="ct-scope ct-ov" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
            <div className="ct-md" role="dialog" aria-modal="true" aria-labelledby="ct-mt">
                <button
                    ref={xRef} type="button" className={`ct-x${showX ? "" : " is-hide"}`}
                    onClick={requestClose} aria-label="Close"
                ><X size={16} /></button>

                <div className="ct-mscroll" ref={scrollRef} onScroll={onScroll}>
                    <div className="ct-mh">
                        <h3 id="ct-mt">Write your message</h3>
                        <small>To: {CONTACT_EMAIL}</small>
                    </div>

                    <div className="ct-tabs">
                        {TOPICS.map((t) => (
                            <button key={t.id} type="button" aria-pressed={t.id === topic.id} onClick={() => pick(t)}>{t.label}</button>
                        ))}
                    </div>

                    <div className="ct-f2">
                        <div>
                            <label htmlFor="ct-m-name">Your name</label>
                            <input id="ct-m-name" autoFocus value={name} placeholder="Jane Smith" onChange={(e) => onName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="ct-m-sub">Subject</label>
                            <input id="ct-m-sub" value={subject} disabled={loading} onChange={(e) => setSubject(e.target.value)} />
                        </div>
                    </div>

                    <label htmlFor="ct-m-body">Message</label>
                    <textarea id="ct-m-body" className="ct-message" value={body} disabled={loading} onChange={(e) => setBody(e.target.value)} />

                    <div className="ct-aibox">
                        <label htmlFor="ct-m-prompt">Let Sreevi write it</label>
                        <Composer
                            id="ct-m-prompt" value={prompt} onChange={setPrompt}
                            loading={loading} error={error} onWrite={write} onStop={stop}
                        />
                    </div>

                    <div className="ct-acts">
                        <a
                            className="ct-btn ct-btn--pri" onClick={onAction}
                            aria-disabled={loading} tabIndex={loading ? -1 : undefined}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bd}`}
                            target="_blank" rel="noopener noreferrer"
                        ><Send size={16} />Open in Gmail</a>
                        <a
                            className="ct-btn" onClick={onAction} aria-disabled={loading} tabIndex={loading ? -1 : undefined}
                            href={`mailto:${CONTACT_EMAIL}?subject=${su}&body=${bd}`}>
                            <Mail size={16} />Open in email app
                        </a>
                        <button type="button" className={`ct-btn${copied ? " is-done" : ""}`} disabled={loading} onClick={copyDraft}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy draft"}
                        </button>
                    </div>
                </div>

                {sheet && <ConfirmSheet mode={sheet} onKeep={() => setSheet(null)} onCopy={copyAndClose} onLeave={onClose} />}
            </div>
        </div>,
        document.body
    );
}

export default function Contact() {
    const [topic, setTopic] = useState(null);

    const download = async () => {
        try {
            const url = URL.createObjectURL(await (await fetch(RESUME_URL)).blob());
            Object.assign(document.createElement("a"), { href: url, download: RESUME_FILE }).click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            window.open(RESUME_URL, "_blank", "noopener");
        }
    };

    return (
        <div className="ct-scope ct-page">
            <header className="ct-hero">
                <div>
                    <h1 className="ct-title">Let’s build something <span className="ct-grad">great together.</span></h1>
                    <p className="ct-lead">Send a message right here, or write me a mail on a topic. I’ll get back to you.</p>
                </div>
                <div className="ct-where">
                    <span className="ct-pin"><MapPin size={17} /></span>
                    <div className="ct-wt">
                        <b>Based in {LOCATION}</b>
                        <span><i className="ct-dot" />{LOCATION_NOTE}</span>
                    </div>
                </div>
            </header>

            <div className="ct-grid">
                <SendCard />
                <div className="ct-side">
                    <div className="ct-resume">
                        <div>
                            <div className="ct-qlabel">Resume</div>
                            <small>Take a look or save a copy</small>
                        </div>
                        <div className="ct-qrow">
                            <a className="ct-btn ct-btn--pri" href="/AkshayKumarReddyNanobolu-Resume.pdf" target="_blank" rel="noopener noreferrer"><Eye size={16} />View</a>
                            <a className="ct-btn" href="/Akshay_Resume.pdf" download="AkshayKumarReddyNanobolu-Resume.pdf"><Download size={16} />Download</a>
                            {/* <button type="button" className="ct-btn" onClick={download}><Download size={16} />Download</button> */}
                        </div>
                    </div>
                    <MailCard onPick={setTopic} />
                </div>
            </div>

            {topic && <Modal initial={topic} onClose={() => setTopic(null)} />}
        </div>
    );
}