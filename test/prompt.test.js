import { test, suite } from "node:test";

import { MockAgent } from "undici";

import { prompt } from "../index.js";

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
});
