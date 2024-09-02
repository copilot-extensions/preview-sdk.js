// @ts-check

/** @type {import('..').PromptInterface} */
export async function prompt(userPrompt, promptOptions) {
  const options = typeof userPrompt === "string" ? promptOptions : userPrompt;

  const promptFetch = options.request?.fetch || fetch;

  const systemMessage = options.tools
    ? "You are a helpful assistant. Use the supplied tools to assist the user."
    : "You are a helpful assistant.";

  const messages = [
    {
      role: "system",
      content: systemMessage,
    },
  ];

  if (options.messages) {
    messages.push(...options.messages);
  }

  if (typeof userPrompt === "string") {
    messages.push({
      role: "user",
      content: userPrompt,
    });
  }

  const response = await promptFetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "copilot-extensions/preview-sdk.js",
        authorization: `Bearer ${options.token}`,
      },
      body: JSON.stringify({
        messages: messages,
        model: options.model,
        toolChoice: options.tools ? "auto" : undefined,
        tools: options.tools,
      }),
    }
  );

  const data = await response.json();

  return {
    requestId: response.headers.get("x-request-id"),
    message: data.choices[0].message,
  };
}
