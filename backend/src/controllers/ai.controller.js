import { runAgent } from "../agent/ai.agent";

export async function handleAIRequest(request, env, ctx) {

    try {

        const body = await request.json();
        const message = body.message;
        const result = await runAgent(message,env);
        return Response.json(result);

    } catch (error) {
        console.error(error);
        console.error("AI ERROR MESSAGE:", error?.message);
        console.error("AI ERROR STATUS:", error?.status);
        console.error("AI ERROR NAME:", error?.name);
        return Response.json(
            {type: "message",message: "Something went wrong."},{status: 500}
        );
    }
}