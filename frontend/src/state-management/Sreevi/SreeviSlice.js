import { createSlice } from "@reduxjs/toolkit";
import { CHAT_CONFIG } from "../../ai/config/chatConfig";

/* ───────────── status constants ───────────── */
export const SREEVI_STATUS = Object.freeze({ IDLE: "idle", WORKING: "working", RESULT: "result" });
export const TURN_STATUS = Object.freeze({ THINKING: "thinking", RUNNING: "running", DONE: "done", FAILED: "failed", CANCELLED: "cancelled" });
export const TASK_STATUS = Object.freeze({ PENDING: "pending", RUNNING: "running", DONE: "done", SKIPPED: "skipped", FAILED: "failed" });
export const STEP_STATUS = Object.freeze({ PENDING: "pending", RUNNING: "running", DONE: "done", FAILED: "failed" });

/*
  Turn  { id, at, status, user:{text}, reply:{text,isError}|null,
          final:{type, pending:[PendingAction]}|null,
          ask, outcome, tasks:[Task], error:{taskId,stepId,message}|null }
  Task  { id, tool, topic, args, label, status, result, link:{href,label}|null, steps:[Step] }
  Step  { id, label, status, detail }
  PendingAction { tool, args, missing:[string] }
*/

const initialState = {
  // launcher
  isOpen: false,
  status: SREEVI_STATUS.IDLE,
  unreadCount: 0,
  notice: null,
  // chat identity: bumped by the X button so work from an older chat can be dropped
  epoch: 0,
  // conversation
  turns: [],
};

/* ───────────── helpers ───────────── */
const clip = (value, max) => String(value ?? "").trim().slice(0, max);
const preview = (text) => (text.length > 48 ? `${text.slice(0, 48)}…` : text);

// Only https links are allowed in the UI
const safeLink = (link) =>
  link && typeof link.href === "string" && link.href.startsWith("https://") && typeof link.label === "string"
    ? { href: link.href, label: clip(link.label, 60) }
    : null;

const findTurn = (state, id) => state.turns.find((t) => t.id === id);
const findTask = (turn, id) => turn?.tasks.find((t) => t.id === id);
const isActive = (status) => status === TASK_STATUS.PENDING || status === TASK_STATUS.RUNNING;

// Task and step events only apply while the turn is running
const runningTask = (state, turnId, taskId) => {
  const turn = findTurn(state, turnId);
  return turn?.status === TURN_STATUS.RUNNING ? findTask(turn, taskId) : undefined;
};

// One line for the model's history, built from what really happened
function buildOutcome(turn, suffix = "") {
  const done = turn.tasks
    .filter((t) => t.status === TASK_STATUS.DONE && t.result)
    .map((t) => t.result)
    .join(" ");
  return clip(`${done} ${suffix}`, CHAT_CONFIG.maxDigestChars);
}

// Launcher after a turn ends: idle if the chat is open, otherwise "result ready" + badge
function settleLauncher(state, notice) {
  if (state.isOpen) {
    state.status = SREEVI_STATUS.IDLE;
    state.notice = null;
    return;
  }
  state.status = SREEVI_STATUS.RESULT;
  state.notice = notice;
  state.unreadCount += 1;
}

const makeTask = (t) => ({
  id: typeof t.id === "string" && t.id ? t.id : crypto.randomUUID(), // the runner supplies the id
  tool: String(t.tool),
  topic: String(t.topic ?? "general"), // copied from the tool definition, never from the model
  args: t.args && typeof t.args === "object" ? t.args : {},
  label: clip(t.label, 80),
  status: TASK_STATUS.PENDING,
  result: "",
  link: null,
  steps: (Array.isArray(t.steps) ? t.steps : []).slice(0, CHAT_CONFIG.maxSteps).map((s) => ({
    id: crypto.randomUUID(),
    label: clip(s.label, 80),
    status: STEP_STATUS.PENDING,
    detail: "",
  })),
});

const makePending = (p) => ({
  tool: String(p.tool),
  args: p.args && typeof p.args === "object" ? p.args : {},
  missing: Array.isArray(p.missing) ? p.missing.map(String) : [],
});

/* ───────────── slice ───────────── */
const sreeviSlice = createSlice({
  name: "sreevi",
  initialState,
  reducers: {
    /* ----- launcher ----- */
    openChat(state) {
      state.isOpen = true;
      state.unreadCount = 0;
      state.notice = null;
      if (state.status === SREEVI_STATUS.RESULT) state.status = SREEVI_STATUS.IDLE;
    },
    closeChat(state) {
      state.isOpen = false; // minimize only: the history is kept
    },
    toggleChat(state) {
      sreeviSlice.caseReducers[state.isOpen ? "closeChat" : "openChat"](state);
    },
    setIdle(state) {
      state.status = SREEVI_STATUS.IDLE;
      state.notice = null;
    },

    /* ----- turn lifecycle (events) ----- */

    // The visitor sent a message
    startTurn: {
      reducer(state, { payload }) {
        state.turns.push({
          id: payload.id,
          at: payload.at,
          status: TURN_STATUS.THINKING,
          user: { text: payload.text },
          reply: null,
          final: null,
          ask: "",
          outcome: "",
          tasks: [],
          error: null,
        });
        if (state.turns.length > CHAT_CONFIG.maxTurns) {
          state.turns.splice(0, state.turns.length - CHAT_CONFIG.maxTurns);
        }
        state.status = SREEVI_STATUS.WORKING;
        state.notice = "Thinking";
      },
      prepare(text) {
        return {
          payload: { id: crypto.randomUUID(), at: Date.now(), text: clip(text, CHAT_CONFIG.maxMessageChars) },
        };
      },
    },

    // The backend answered
    decisionReceived: {
      reducer(state, { payload }) {
        const turn = findTurn(state, payload.turnId);
        if (!turn || turn.status !== TURN_STATUS.THINKING) return; // chat was cleared, cancelled, or already handled

        turn.reply = { text: payload.reply, isError: false };
        turn.final = payload.final;
        turn.ask = payload.ask;
        turn.tasks = payload.tasks;

        if (turn.tasks.length === 0) {
          // answer / clarify / decline: nothing to run, the turn is already finished
          turn.status = TURN_STATUS.DONE;
          turn.outcome = payload.note || clip(payload.reply, CHAT_CONFIG.maxDigestChars);
          settleLauncher(state, preview(payload.reply));
          return;
        }
        turn.status = TURN_STATUS.RUNNING;
      },
      prepare({ turnId, reply, final, ask, note, tasks }) {
        return {
          payload: {
            turnId,
            reply: clip(reply, CHAT_CONFIG.maxTextChars * 2),
            final: {
              type: final?.type ?? "answer",
              pending: (Array.isArray(final?.pending) ? final.pending : []).slice(0, CHAT_CONFIG.maxTasks).map(makePending),
            },
            ask: clip(ask, CHAT_CONFIG.maxDigestChars),
            note: clip(note, CHAT_CONFIG.maxDigestChars),
            tasks: (Array.isArray(tasks) ? tasks : []).slice(0, CHAT_CONFIG.maxTasks).map(makeTask),
          },
        };
      },
    },

    // `link` is the clickable fallback; `result` is the line shown while it runs ("Opening … in 5 seconds")
    taskStarted(state, { payload: { turnId, taskId, link, result } }) {
      const task = runningTask(state, turnId, taskId);
      if (!task) return;
      task.status = TASK_STATUS.RUNNING;
      if (link) task.link = safeLink(link);
      if (typeof result === "string") task.result = clip(result, CHAT_CONFIG.maxDetailChars);
    },

    // Marks a planned step as running, or appends a new one (model-driven loops later)
    stepStarted: {
      reducer(state, { payload: { turnId, taskId, stepId, label } }) {
        const task = runningTask(state, turnId, taskId);
        if (!task) return;
        const step = task.steps.find((s) => s.id === stepId);
        if (step) {
          step.status = STEP_STATUS.RUNNING;
        } else if (task.steps.length < CHAT_CONFIG.maxSteps) {
          task.steps.push({ id: stepId, label: clip(label, 80), status: STEP_STATUS.RUNNING, detail: "" });
        }
      },
      prepare({ turnId, taskId, stepId, label }) {
        return { payload: { turnId, taskId, stepId: stepId ?? crypto.randomUUID(), label } };
      },
    },

    stepFinished(state, { payload: { turnId, taskId, stepId, ok, detail } }) {
      const step = runningTask(state, turnId, taskId)?.steps.find((s) => s.id === stepId);
      if (!step) return;
      step.status = ok ? STEP_STATUS.DONE : STEP_STATUS.FAILED;
      step.detail = clip(detail, CHAT_CONFIG.maxDetailChars);
    },

    // status: "done" | "skipped" ("already in dark mode") | "failed"
    taskFinished(state, { payload: { turnId, taskId, status, result, link } }) {
      const task = runningTask(state, turnId, taskId);
      if (!task) return;
      task.status = [TASK_STATUS.DONE, TASK_STATUS.SKIPPED, TASK_STATUS.FAILED].includes(status) ? status : TASK_STATUS.DONE;
      task.result = clip(result, CHAT_CONFIG.maxDetailChars);
      task.link = safeLink(link);
    },

    // Everything ran. Only acts on a running turn.
    turnFinished(state, { payload: { turnId } }) {
      const turn = findTurn(state, turnId);
      if (!turn || turn.status !== TURN_STATUS.RUNNING) return;
      turn.status = TURN_STATUS.DONE;
      turn.outcome = buildOutcome(turn) || turn.outcome || "Done.";
      settleLauncher(state, preview(turn.reply?.text ?? "Done"));
    },

    // A task failed (taskId given), or the request itself failed (no taskId, nothing decided)
    turnFailed(state, { payload: { turnId, taskId, stepId, message } }) {
      const turn = findTurn(state, turnId);
      if (!turn || ![TURN_STATUS.THINKING, TURN_STATUS.RUNNING].includes(turn.status)) return;

      const text = clip(message, CHAT_CONFIG.maxDetailChars) || "Something went wrong.";
      turn.status = TURN_STATUS.FAILED;
      turn.error = { taskId: taskId ?? null, stepId: stepId ?? null, message: text };
      if (!turn.reply) turn.reply = { text, isError: true }; // transport failure: there was no decision

      for (const task of turn.tasks) {
        if (task.id === taskId) {
          task.status = TASK_STATUS.FAILED;
          const step = task.steps.find((s) => s.id === stepId);
          if (step) {
            step.status = STEP_STATUS.FAILED;
            step.detail = step.detail || text;
          }
        } else if (isActive(task.status)) {
          task.status = TASK_STATUS.SKIPPED;
          task.result = "Not run.";
        }
      }
      turn.outcome = buildOutcome(turn, `Failed: ${text}`);
      settleLauncher(state, "Something went wrong");
    },

    // Stop button. Finished steps stay as they are (no rollback).
    turnCancelled(state, { payload: { turnId } }) {
      const turn = findTurn(state, turnId);
      if (!turn || ![TURN_STATUS.THINKING, TURN_STATUS.RUNNING].includes(turn.status)) return;
      turn.status = TURN_STATUS.CANCELLED;
      for (const task of turn.tasks) {
        if (isActive(task.status)) {
          task.status = TASK_STATUS.SKIPPED;
          task.result = "Cancelled.";
        }
      }
      turn.outcome = buildOutcome(turn, "Cancelled.");
      state.status = SREEVI_STATUS.IDLE;
      state.notice = null;
    },

    // The X button: wipe the chat. Late events for old turn ids find nothing and do nothing.
    clearConversation(state) {
      state.turns = [];
      state.epoch += 1;
      state.status = SREEVI_STATUS.IDLE;
      state.unreadCount = 0;
      state.notice = null;
    },
  },
});

export const {
  openChat, closeChat, toggleChat, setIdle,
  startTurn, decisionReceived, taskStarted, stepStarted, stepFinished,
  taskFinished, turnFinished, turnFailed, turnCancelled, clearConversation,
} = sreeviSlice.actions;

/* ───────────── selectors (derived values are never stored) ───────────── */
export const selectSreevi = (state) => state.sreevi;
export const selectTurns = (state) => state.sreevi.turns;
export const selectEpoch = (state) => state.sreevi.epoch;
export const selectBusy = (state) => {
  const last = state.sreevi.turns.at(-1);
  return last?.status === TURN_STATUS.THINKING || last?.status === TURN_STATUS.RUNNING;
};

export default sreeviSlice.reducer;