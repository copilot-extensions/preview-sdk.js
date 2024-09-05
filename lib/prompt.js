// @ts-check

/** @type {import('..').PromptInterface} */

function parsePromptArguments(userPrompt, promptOptions) {
  const { request: requestOptions, ...options } =
    typeof userPrompt === "string" ? promptOptions : userPrompt;

  const promptFetch = requestOptions?.fetch || fetch;
  const model = options.model || "gpt-4";
  const endpoint =
    options.endpoint || "https://api.githubcopilot.com/chat/completions";

  const systemMessage = options.tools
    ? "You are a helpful assistant. Use the supplied tools to assist the user."
    : "You are a helpful assistant.";
  const toolsChoice = options.tools ? "auto" : undefined;

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

  return [promptFetch, { ...options, messages, model, endpoint, toolsChoice }];
}

async function sendPromptRequest(promptFetch, options) {
  const { endpoint, token, ...payload } = options;
  const method = "POST";
  const headers = {
    accept: "application/json",
    "content-type": "application/json; charset=UTF-8",
    "user-agent": "copilot-extensions/preview-sdk.js",
    authorization: `Bearer ${token}`,
  };

  const response = await promptFetch(endpoint, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return response;
  }

  const body = await response.text();
  console.log({ body });

  throw Object.assign(
    new Error(
      `[@copilot-extensions/preview-sdk] An error occured with the chat completions API`,
    ),
    {
      name: "PromptError",
      request: {
        method: "POST",
        url: endpoint,
        headers: {
          ...headers,
          authorization: `Bearer [REDACTED]`,
        },
        body: payload,
      },
      response: {
        status: response.status,
        headers: [...response.headers],
        body: body,
      },
    },
  );
}
export async function prompt(userPrompt, promptOptions) {
  const [promptFetch, options] = parsePromptArguments(
    userPrompt,
    promptOptions,
  );
  const response = await sendPromptRequest(promptFetch, options);
  const requestId = response.headers.get("x-request-id");

  const data = await response.json();

  return {
    requestId,
    message: data.choices[0].message,
  };
}

prompt.stream = async function promptStream(userPrompt, promptOptions) {
  const [promptFetch, options] = parsePromptArguments(
    userPrompt,
    promptOptions,
  );
  const response = await sendPromptRequest(promptFetch, {
    ...options,
    stream: true,
  });

  return {
    requestId: response.headers.get("x-request-id"),
    stream: response.body,
  };
};

/** @type {import('..').GetFunctionCallsInterface} */
export function getFunctionCalls(payload) {
  const functionCalls = payload.message.tool_calls;

  if (!functionCalls) return [];

  return functionCalls.map((call) => {
    return {
      id: call.id,
      function: {
        name: call.function.name,
        arguments: call.function.arguments,
      },
    };
  });
}
