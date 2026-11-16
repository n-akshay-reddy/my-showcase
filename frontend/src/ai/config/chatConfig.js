const int = (raw, fallback, min, max) => {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

// Every frontend limit lives here. Keep the numbers in step with backend/agent/limits.js.
export const CHAT_CONFIG = Object.freeze({
  maxTurns: int(import.meta.env.VITE_CHAT_HISTORY_MAX_TURNS, 20, 4, 50), // turns kept in Redux
  recentTurns: 2,        // sent to the backend as raw text (2 turns = 4 messages)
  historyTurns: 8,       // sent as one-line digests
  maxTasks: 4,           // tasks per turn
  maxSteps: 8,           // steps per task
  maxMessageChars: 1000, // visitor message (textarea and backend must match)
  maxTextChars: 300,     // raw text clipped when sent as context
  maxDetailChars: 200,   // step detail, task result, error message
  maxDigestChars: 200,   // ask, outcome
  pendingTtlMs: 5 * 60 * 1000, // a clarify nobody answered for 5 minutes is ignored
  terminalDelayMs: 5000, // announce, then open the page/tab after this delay
  internalNavDelayMs: int(import.meta.env.VITE_INTERNAL_NAVIGATION_DELAY_MS, 3000, 0, 10000),
  stepPauseMs: 400,      // short pause on each ordinary task so progress is visible
});