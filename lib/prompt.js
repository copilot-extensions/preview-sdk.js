// @ts-check

/** @type {import('..').PromptInterface} */
export async function prompt(userPrompt, promptOptions) {
  const promptFetch = promptOptions.request?.fetch || fetch;

  const systemMessage = promptOptions.tools
    ? "You are a helpful assistant. Use the supplied tools to assist the user."
    : "You are a helpful assistant.";

  const response = await promptFetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "copilot-extensions/preview-sdk.js",
        authorization: `Bearer ${promptOptions.token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: promptOptions.model,
        toolChoice: promptOptions.tools ? "auto" : undefined,
        tools: promptOptions.tools,
      }),
    }
  );

  const data = await response.json();

  return {
    requestId: response.headers.get("x-request-id"),
    message: data.choices[0].message,
  };
}
