import test from "ava";

import { MockAgent } from "undici";

import { prompt, getFunctionCalls } from "../index.js";
import { parsePromptArguments } from "../lib/prompt.js";

test("smoke", (t) => {
  t.is(typeof prompt, "function");
});

test("minimal usage", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "What is the capital of France?",
          },
        ],
        model: "gpt-4o",
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt("What is the capital of France?", {
    token: "secret",
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("options.prompt", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        model: "<custom-model>",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" },
          { role: "assistant", content: "The capital of France is Paris." },
          { role: "user", content: "What about Spain?" },
        ],
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt("What about Spain?", {
    model: "<custom-model>",
    token: "secret",
    messages: [
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
    ],
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("options.messages", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" },
          { role: "assistant", content: "The capital of France is Paris." },
          { role: "user", content: "What about Spain?" },
        ],
        model: "gpt-4o",
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt("What about Spain?", {
    token: "secret",
    messages: [
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
    ],
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("options.endpoint", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://my-copilot-endpoint.test");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "What is the capital of France?",
          },
        ],
        model: "gpt-4o",
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt("What is the capital of France?", {
    token: "secret",
    endpoint: "https://my-copilot-endpoint.test/chat/completions",
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("single options argument", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" },
          { role: "assistant", content: "The capital of France is Paris." },
          { role: "user", content: "What about Spain?" },
        ],
        model: "gpt-4o",
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt({
    token: "secret",
    messages: [
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
      { role: "user", content: "What about Spain?" },
    ],
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("function calling", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        tools: [
          {
            type: "function",
            function: { name: "the_function", description: "The function" },
          },
        ],
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Use the supplied tools to assist the user.",
          },
          { role: "user", content: "Call the function" },
        ],
        model: "gpt-4o",
        toolsChoice: "auto",
      }),
    })
    .reply(
      200,
      {
        choices: [
          {
            message: {
              content: "<response text>",
            },
          },
        ],
      },
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  const result = await prompt("Call the function", {
    token: "secret",
    tools: [
      {
        type: "function",
        function: {
          name: "the_function",
          description: "The function",
        },
      },
    ],
    request: { fetch: fetchMock },
  });

  t.deepEqual(result, {
    requestId: "<request-id>",
    message: {
      content: "<response text>",
    },
  });
});

test("Handles error", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "What is the capital of France?",
          },
        ],
        model: "gpt-4o",
      }),
    })
    .reply(400, "Bad Request", {
      headers: {
        "content-type": "text/plain",
        "x-request-id": "<request-id>",
      },
    });

  await t.throwsAsync(
    async () => {
      await prompt("What is the capital of France?", {
        token: "secret",
        request: { fetch: fetchMock },
      });
    },
    {
      name: "PromptError",
      message:
        "[@copilot-extensions/preview-sdk] An error occured with the chat completions API",
    },
  );
});

test("includes function calls", async (t) => {
  const tool_calls = [
    {
      function: {
        arguments: '{\n  "order_id": "123"\n}',
        name: "get_delivery_date",
      },
      id: "call_Eko8Jz0mgchNOqiJJrrMr8YW",
      type: "function",
    },
  ];
  const result = getFunctionCalls({
    requestId: "<request-id>",
    message: {
      role: "assistant",
      tool_calls,
    },
  });

  t.deepEqual(
    result,
    tool_calls.map((call) => {
      return {
        id: call.id,
        function: {
          name: call.function.name,
          arguments: call.function.arguments,
        },
      };
    }),
  );
});

test("does not include function calls", async (t) => {
  const result = getFunctionCalls({
    requestId: "<request-id>",
    message: {
      content: "Hello! How can I assist you today?",
      role: "assistant",
    },
  });

  t.deepEqual(result, []);
});

test("parsePromptArguments - uses Node fetch if no options.fetch passed as argument", (t) => {
  const [parsedFetch] = parsePromptArguments(
    "What is the capital of France?",
    {}
  );

  t.deepEqual(fetch, parsedFetch);
});

test("prompt.stream", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.githubcopilot.com");
  mockPool
    .intercept({
      method: "post",
      path: `/chat/completions`,
    })
    .reply(200, "<response text>", {
      headers: {
        "content-type": "text/plain",
        "x-request-id": "<request-id>",
      },
    });

  const { requestId, stream } = await prompt.stream(
    "What is the capital of France?",
    {
      token: "secret",
      request: {
        fetch: fetchMock,
      },
    }
  );

  t.is(requestId, "<request-id>");

  let data = "";
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    data += new TextDecoder().decode(value);
  }

  t.deepEqual(data, "<response text>");
});
