import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles } from "lucide-react";

import SreeviRobot from "../SreeviRobot/SreeviRobot";
import SreeviChat from "../Sreevichat/Sreevichat"; // must match your real folder + file name exactly
import {
  openChat,
  selectSreevi,
  SREEVI_STATUS,
} from "../../../state-management/Sreevi/SreeviSlice";
import "./SreeviLauncher.css";

const GREETING_MS = 6000;

const COPY = {
  [SREEVI_STATUS.IDLE]: { title: "Hi! I'm Sreevi", sub: "Your AI Portfolio Agent" },
  [SREEVI_STATUS.WORKING]: { title: "Sreevi is working", sub: "Hang tight..." },
  [SREEVI_STATUS.RESULT]: { title: "Sreevi replied", sub: "Tap to read it" },
};

function SreeviLauncher() {
  const dispatch = useDispatch();
  const { isOpen, status, unreadCount, notice } = useSelector(selectSreevi);

  const tiltRef = useRef(null);
  const [greeting, setGreeting] = useState(true);

  // Show the "Hi! I'm Sreevi" bubble briefly on first load.
  useEffect(() => {
    const id = setTimeout(() => setGreeting(false), GREETING_MS);
    return () => clearTimeout(id);
  }, []);

  // Eyes follow the cursor anywhere on screen
  useEffect(() => {
    if (isOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const setEyes = (x, y) => {
      const el = tiltRef.current;
      if (!el) return;
      el.style.setProperty("--ex", `${x.toFixed(2)}px`);
      el.style.setProperty("--ey", `${y.toFixed(2)}px`);
    };

    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = tiltRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.5);
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(dist / 220, 1); // full range at 220px away
        setEyes((dx / dist) * strength * 7, (dy / dist) * strength * 5);
      });
    };

    const onLeave = () => setEyes(0, 0);

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [isOpen]);

  const handlePointerMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 26).toFixed(1)}deg`);
    el.style.setProperty("--rx", `${(-y * 22).toFixed(1)}deg`);
  };

  const resetTilt = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  const copy = COPY[status] ?? COPY[SREEVI_STATUS.IDLE];
  const pinned = status === SREEVI_STATUS.RESULT; // reply preview stays visible until opened
  const working = status === SREEVI_STATUS.WORKING;
  const showGreeting = greeting && status === SREEVI_STATUS.IDLE;
  const showBadge = status === SREEVI_STATUS.RESULT && unreadCount > 0;

  const label =
    status === SREEVI_STATUS.WORKING
      ? "Open Sreevi, currently working"
      : showBadge
      ? `Open Sreevi, ${unreadCount} new ${unreadCount === 1 ? "message" : "messages"}`
      : "Open Sreevi";

  const classes = [
    "sreevi",
    isOpen && "is-hidden",
    pinned && "is-pinned",
    showGreeting && "is-greeting",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Launcher (robot button) - hides itself while the chat is open */}
      <div className={classes} data-status={status} aria-hidden={isOpen || undefined}>
        <div className="sreevi__bubble" role="status" aria-live="polite">
          <strong>{copy.title}</strong>
          <small>
            {notice || copy.sub}
            {status === SREEVI_STATUS.WORKING && (
              <span className="sreevi__dots" aria-hidden="true">
                <i /><i /><i />
              </span>
            )}
          </small>
        </div>

        <button
          type="button"
          className="sreevi__btn"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          tabIndex={isOpen ? -1 : 0}
          onClick={() => dispatch(openChat())}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          onBlur={resetTilt}
        >
          {/* hover lighting */}
          <span className="sreevi__spot" aria-hidden="true" />
          <span className="sreevi__floor" aria-hidden="true" />

          {/* working ring */}
          <span className="sreevi__ring" aria-hidden="true" />

          <span className="sreevi__float">
            <span className="sreevi__tilt" ref={tiltRef}>
              <SreeviRobot status={status} />
            </span>
          </span>

          {/* sparkles */}
          <i className="sreevi__sp sreevi__sp--1" aria-hidden="true" />
          <i className="sreevi__sp sreevi__sp--2" aria-hidden="true" />
          <i className="sreevi__sp sreevi__sp--3" aria-hidden="true" />

          {showBadge && (
            <span className="sreevi__badge" aria-hidden="true">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {status !== SREEVI_STATUS.IDLE && (
          <span className="sreevi__pill" data-status={status}>
            <Sparkles size={12} aria-hidden="true" />
            {working ? "Working" : "Result ready"}
            {working && (
              <span className="sreevi__dots" aria-hidden="true">
                <i /><i /><i />
              </span>
            )}
          </span>
        )}
      </div>

      {/* Chat panel - sibling of the launcher, NOT inside the button */}
      <SreeviChat />
    </>
  );
}

export default SreeviLauncher;