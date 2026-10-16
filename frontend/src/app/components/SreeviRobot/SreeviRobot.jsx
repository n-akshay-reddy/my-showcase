import { memo } from "react";
import "./SreeviRobot.css";

/**
 * The Sreevi robot artwork (pure SVG, no state).
 * Reuse it anywhere (launcher, chat header, message avatars).
 *
 * status: "idle" | "working" | "result"
 *
 * Gradient ids are prefixed with "sv-" and are identical in every instance,
 * so rendering it several times on a page is safe.
 */
function SreeviRobot({ status = "idle", className = "", ...rest }) {
  return (
    <svg
      className={`sreevi-robot sreevi-robot--${status} ${className}`.trim()}
      viewBox="0 0 160 176"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <defs>
        <radialGradient id="sv-gh" cx="34%" cy="22%" r="90%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".42" stopColor="#f1ecff" />
          <stop offset=".78" stopColor="#cdbffb" />
          <stop offset="1" stopColor="#9f8ee6" />
        </radialGradient>
        <linearGradient id="sv-gs" x1="0" y1="0" x2="0" y2="1">
          <stop offset=".55" stopColor="#6d56c8" stopOpacity="0" />
          <stop offset="1" stopColor="#6d56c8" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="sv-gv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a38b5" />
          <stop offset=".45" stopColor="#1c1257" />
          <stop offset="1" stopColor="#0a0627" />
        </linearGradient>
        <linearGradient id="sv-gc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8c8ff" />
          <stop offset=".5" stopColor="#9b6cf5" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="sv-ge" cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".5" stopColor="#b8f3ff" />
          <stop offset="1" stopColor="#22d3ee" />
        </radialGradient>
        <radialGradient id="sv-go" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".35" stopColor="#fbcfe8" />
          <stop offset="1" stopColor="#db2777" />
        </radialGradient>
        <linearGradient id="sv-gx" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="sv-bl" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* antenna */}
      <line x1="80" y1="16" x2="80" y2="34" stroke="#a898ea" strokeWidth="4" strokeLinecap="round" />
      <circle className="sreevi-led" cx="80" cy="12" r="13" fill="#f472b6" opacity=".3" />
      <circle cx="80" cy="12" r="7.5" fill="url(#sv-go)" />

      {/* ears */}
      <ellipse cx="19" cy="86" rx="14" ry="24" fill="url(#sv-gc)" />
      <ellipse cx="21" cy="86" rx="8" ry="15" fill="#3b1a8f" />
      <ellipse cx="21" cy="86" rx="4" ry="9" fill="#22d3ee" opacity=".55" />
      <ellipse cx="15" cy="72" rx="4" ry="9" fill="#fff" opacity=".45" />
      <ellipse cx="141" cy="86" rx="14" ry="24" fill="url(#sv-gc)" />
      <ellipse cx="139" cy="86" rx="8" ry="15" fill="#3b1a8f" />
      <ellipse cx="139" cy="86" rx="4" ry="9" fill="#22d3ee" opacity=".55" />
      <ellipse cx="145" cy="72" rx="4" ry="9" fill="#fff" opacity=".35" />

      {/* neck + body */}
      <rect x="68" y="126" width="24" height="14" rx="6" fill="#7f6ed6" />
      <rect x="46" y="134" width="68" height="40" rx="24" fill="url(#sv-gh)" />
      <rect x="46" y="134" width="68" height="40" rx="24" fill="url(#sv-gs)" />
      <circle cx="80" cy="154" r="11" fill="#2a1a6e" />
      <circle className="sreevi-led" cx="80" cy="154" r="8" fill="url(#sv-go)" />
      <circle cx="80" cy="154" r="11" fill="none" stroke="#c4b5fd" strokeWidth="1.5" />

      {/* head */}
      <rect x="26" y="30" width="108" height="104" rx="50" fill="url(#sv-gh)" />
      <rect x="26" y="30" width="108" height="104" rx="50" fill="url(#sv-gs)" />
      <rect x="26.8" y="30.8" width="106.4" height="102.4" rx="49.5" fill="none" stroke="#fff" strokeWidth="1.8" opacity=".95" />
      <ellipse cx="54" cy="46" rx="22" ry="9" fill="url(#sv-gx)" transform="rotate(-24 54 46)" />

      {/* visor */}
      <rect x="38" y="54" width="84" height="60" rx="30" fill="url(#sv-gv)" />
      <rect x="38" y="54" width="84" height="60" rx="30" fill="none" stroke="#a99bff" strokeWidth="1.6" opacity=".8" />
      <path d="M50 64Q78 54 106 62" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".2" strokeLinecap="round" />

      {/* eyes */}
      <g className="sreevi-eyes">
      <g className="sreevi-eye">
        <ellipse cx="62" cy="84" rx="12" ry="15" fill="#22d3ee" opacity=".55" filter="url(#sv-bl)" />
        <ellipse cx="62" cy="84" rx="9" ry="12.5" fill="url(#sv-ge)" />
        <circle cx="59" cy="78" r="3" fill="#fff" />
      </g>
      <g className="sreevi-eye">
        <ellipse cx="98" cy="84" rx="12" ry="15" fill="#22d3ee" opacity=".55" filter="url(#sv-bl)" />
        <ellipse cx="98" cy="84" rx="9" ry="12.5" fill="url(#sv-ge)" />
        <circle cx="95" cy="78" r="3" fill="#fff" />
      </g>
      </g>

      {/* mouth + cheeks */}
      <path d="M72 102Q80 108 88 102" fill="none" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="49" cy="100" rx="5" ry="3" fill="#f0abfc" opacity=".55" />
      <ellipse cx="111" cy="100" rx="5" ry="3" fill="#f0abfc" opacity=".55" />
    </svg>
  );
}

export default memo(SreeviRobot);