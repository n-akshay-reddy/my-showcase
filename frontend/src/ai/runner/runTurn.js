import { executeFrontendTool } from "../executor/executeFrontendTool";
import { CHAT_CONFIG } from "../config/chatConfig";
import {
    decisionReceived,
    taskStarted,
    taskFinished,
    turnFinished,
    turnFailed,
} from "../../state-management/Sreevi/SreeviSlice";

const FAILED_MESSAGE = "That action didn't work. Please try again.";

// The handle for ONE turn in flight.
//  - abort(): the Stop and X buttons use it; it also cancels the network call
//  - skipCountdown(): the visitor clicked the fallback link themselves, so don't open it again
export function createRun() {
    const controller = new AbortController();
    const run = {
        signal: controller.signal,
        skip: null,
        abort: () => controller.abort(),
        skipCountdown: () => run.skip?.(),
    };
    return run;
}

// Resolves "elapsed" | "aborted" | "skipped"
function wait(ms, run) {
    return new Promise((resolve) => {
        if (run.signal.aborted) return resolve("aborted");

        const done = (outcome) => {
            clearTimeout(timer);
            run.signal.removeEventListener("abort", onAbort);
            run.skip = null;
            resolve(outcome);
        };
        const onAbort = () => done("aborted");
        const timer = setTimeout(() => done("elapsed"), ms);

        run.skip = () => done("skipped");
        run.signal.addEventListener("abort", onAbort, { once: true });
    });
}

function buildPlan(decision) {
    if (decision?.type !== "execute" || !Array.isArray(decision.tools)) return [];

    return decision.tools.slice(0, CHAT_CONFIG.maxTasks).map((tool) => ({
        id: crypto.randomUUID(),
        name: tool.name,
        args: tool.args ?? {},
        topic: tool.topic,
        label: tool.label,
        terminal: Boolean(tool.terminal),
        runsOn: tool.runsOn,
    }));
}

// Returns true when the task finished, false when the run must stop
// (failed, stopped, or the chat was cleared).
async function runTask({ turnId, task, run, stale, dispatch, navigate }) {
    const fail = (message) => {
        dispatch(turnFailed({ turnId, taskId: task.id, message }));
        return false;
    };

    try {
        if (task.runsOn !== "frontend") return fail("I can't do that action here.");

        // Ordinary tasks show their spinner for a moment first, so the progress is visible
        if (!task.terminal) {
            dispatch(taskStarted({ turnId, taskId: task.id }));
            if ((await wait(CHAT_CONFIG.stepPauseMs, run)) === "aborted" || stale()) return false;
        }

        const result = executeFrontendTool({ name: task.name, args: task.args }, { navigate });
        if (!result.ok) return fail(result.message || FAILED_MESSAGE);

        // Terminal tasks (open a page or tab): announce first, with the fallback link
        if (task.terminal) {
            dispatch(
                taskStarted({
                    turnId,
                    taskId: task.id,
                    link: result.link,
                    result: result.after ? result.message : undefined,
                })
            );
        }

        if (result.after) {
            const outcome = await wait(result.delayMs ?? CHAT_CONFIG.terminalDelayMs, run);
            if (outcome === "aborted" || stale()) return false;
            if (outcome === "elapsed") result.after(); // "skipped" = the visitor already opened the link
        }

        dispatch(
            taskFinished({
                turnId,
                taskId: task.id,
                status: result.changed === false ? "skipped" : "done",
                result: result.doneMessage ?? result.message,
                link: result.link ?? null,
            })
        );
        return true;
    } catch {
        return fail(FAILED_MESSAGE);
    }
}

// Takes a validated decision from the backend and plays it out, dispatching events as it goes.
export async function runTurn({ turnId, decision, run, epoch, dispatch, getState, navigate }) {
    const plan = buildPlan(decision);

    dispatch(
        decisionReceived({
            turnId,
            reply: decision.message,
            final: { type: decision.type, pending: decision.pending },
            ask: decision.ask,
            note: decision.note,
            tasks: plan.map(({ id, name, args, topic, label }) => ({ id, tool: name, topic, args, label })),
        })
    );

    // answer / clarify / decline: the reducer already finished the turn
    if (plan.length === 0) return;

    // Stop pressed, X pressed, or a different chat: do nothing more
    const stale = () => run.signal.aborted || getState().sreevi.epoch !== epoch;

    for (const task of plan) {
        if (stale()) return;
        const completed = await runTask({ turnId, task, run, stale, dispatch, navigate });
        if (!completed) return; // the failure, if any, is already in the state
    }

    if (!stale()) dispatch(turnFinished({ turnId }));
}