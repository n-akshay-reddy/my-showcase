export const composeEmail = {
    name: "composeEmail",
    topic: "contact",
    runsOn: "frontend",
    description:
        "Open the visitor's mail app with a new email to Akshay. The recipient is filled in by the app, " +
        "never provide an address. subject and body are optional: leave both out to open an empty email. " +
        "Provide them only when the user asked you to draft the message.",
    args: {
        subject: { type: "string", required: false },
        body: { type: "string", required: false }
    }
};