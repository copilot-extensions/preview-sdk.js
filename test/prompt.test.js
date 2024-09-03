import { test, suite } from "node:test";

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
        }
      );

    const result = await prompt("What is the capital of France?", {
      token: "secret",
      model: "gpt-4",
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
        }
      );

    const result = await prompt("What about Spain?", {
      model: "gpt-4",
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
        }
      );

    const result = await prompt({
      model: "gpt-4",
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
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Use the supplied tools to assist the user.",
            },
            { role: "user", content: "Call the function" },
          ],
          model: "gpt-4",
          toolChoice: "auto",
          tools: [
            {
              type: "function",
              function: { name: "the_function", description: "The function" },
            },
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
        }
      );

    const result = await prompt("Call the function", {
      token: "secret",
      model: "gpt-4",
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

    const result = await prompt("What is the capital of France?", {
      token: "secret",
      model: "gpt-4",
      request: { fetch: fetchMock },
    });

    t.assert.deepEqual(result, {
      message: {
        content:
          "Sorry, an error occured with the chat completions API. (Status: 400, request ID: <request-id>)",
        role: "Sssistant",
      },
      requestId: "<request-id>",
    });
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
        })
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
