import { test, suite } from "node:test";
import assert from "node:assert";

import { MockAgent } from "undici";

import { prompt, getFunctionCalls } from "../index.js";

suite("prompt", () => {
  test("smoke", (t) => {
    t.assert.equal(typeof prompt, "function");
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
          model: "gpt-4",
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

    t.assert.deepEqual(result, {
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

    t.assert.deepEqual(result, {
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
          model: "gpt-4",
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

    t.assert.deepEqual(result, {
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
          model: "gpt-4",
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

    t.assert.deepEqual(result, {
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
          model: "gpt-4",
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

    t.assert.deepEqual(result, {
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
          model: "gpt-4",
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

    t.assert.deepEqual(result, {
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
          model: "gpt-4",
        }),
      })
      .reply(400, "Bad Request", {
        headers: {
          "content-type": "text/plain",
          "x-request-id": "<request-id>",
        },
      });

    await assert.rejects(
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
        request: {
          method: "POST",
          url: "https://api.githubcopilot.com/chat/completions",
          headers: {
            "content-type": "application/json; charset=UTF-8",
            "user-agent": "copilot-extensions/preview-sdk.js",
            accept: "application/json",
            authorization: "Bearer [REDACTED]",
          },
          body: {
            messages: [
              {
                content: "You are a helpful assistant.",
                role: "system",
              },
              {
                content: "What is the capital of France?",
                role: "user",
              },
            ],
            model: "gpt-4",
            toolsChoice: undefined,
          },
        },
        response: {
          status: 400,
          headers: [
            ["content-type", "text/plain"],
            ["x-request-id", "<request-id>"],
          ],
          body: "Bad Request",
        },
      },
    );
  });

  suite("getFunctionCalls()", () => {
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

      t.assert.deepEqual(
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

      t.assert.deepEqual(result, []);
    });
  });
});
