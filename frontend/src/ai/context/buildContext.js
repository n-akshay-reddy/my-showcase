import { CHAT_CONFIG } from "../config/chatConfig";

const clip = (text, max) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

// Only turns the model actually answered. Network failures and early cancels never reached a decision.
const usable = (turn) => turn.final !== null && turn.status !== "thinking" && turn.status !== "running";

// What Sreevi said, plus what really happened (a task can fail after Sreevi announced it)
const agentText = (turn) =>
  turn.tasks.length > 0 && turn.outcome ? `${turn.reply?.text ?? ""} (Result: ${turn.outcome})` : turn.reply?.text ?? "";

// One line for an older turn
const digest = (turn) =>
  clip(
    [turn.ask, turn.outcome].filter(Boolean).join(" ") ||
      `User: ${clip(turn.user.text, 80)} | Sreevi: ${clip(turn.reply?.text, 80)}`,
    CHAT_CONFIG.maxDigestChars
  );

// The pending question is the last turn, if it was a fresh, finished clarify
function pendingFrom(turns) {
  const last = turns.at(-1);
  if (!last || last.status !== "done" || last.final?.type !== "clarify") return [];
  if (Date.now() - last.at > CHAT_CONFIG.pendingTtlMs) return [];
  return last.final.pending.map(({ tool, args, missing }) => ({ tool, args, missing }));
}

export function buildContext(turns) {
  const list = turns.filter(usable);
  const recentTurns = list.slice(-CHAT_CONFIG.recentTurns);
  const older = list.slice(0, list.length - recentTurns.length).slice(-CHAT_CONFIG.historyTurns);

  return {
    pending: pendingFrom(turns),
    history: older.map(digest),
    recent: recentTurns.flatMap((t) => [
      { role: "user", text: clip(t.user.text, CHAT_CONFIG.maxTextChars) },
      { role: "agent", text: clip(agentText(t), CHAT_CONFIG.maxTextChars) },
    ]),
  };
}