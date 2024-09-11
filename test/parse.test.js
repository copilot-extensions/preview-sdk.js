import test from 'ava';

import { MockAgent } from "undici";
import { request as defaultRequest } from "@octokit/request";

import {
  getUserConfirmation,
  getUserMessage,
  parseRequestBody,
  transformPayloadForOpenAICompatibility,
  verifyAndParseRequest,
} from "../index.js";
import {
  CURRENT_PUBLIC_KEY,
  KEY_ID,
  RAW_BODY,
  SIGNATURE,
} from "./verification.test.js";


test("parseRequestBody()", (t) => {
  // parseRequestBody() does not check for structure. We assume it adheres
  // to the expected structure when we verify that request came indeed
  // from GitHub
  const payload = parseRequestBody('{"messages": []}');
  t.deepEqual(payload.messages, []);
});

test("transformPayloadForOpenAICompatibility()", (t) => {
  const payload = transformPayloadForOpenAICompatibility({
    messages: [
      {
        role: "role",
        name: "name",
        content: "content",
        someCopilotKey: "value",
      },
    ],
    someCopilotKey: "value",
  });
  t.deepEqual(payload.messages, [
    {
      role: "role",
      name: "name",
      content: "content",
    },
  ]);
});

test("verifyAndParseRequest()", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.github.com");
  mockPool
    .intercept({
      method: "get",
      path: `/meta/public_keys/copilot_api`,
    })
    .reply(
      200,
      {
        public_keys: [
          {
            key: CURRENT_PUBLIC_KEY,
            key_identifier: KEY_ID,
            is_current: true,
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
  const testRequest = defaultRequest.defaults({
    request: { fetch: fetchMock },
  });

  const result = await verifyAndParseRequest(RAW_BODY, SIGNATURE, KEY_ID, {
    request: testRequest,
  });

  t.deepEqual(
    { isValidRequest: true, payload: JSON.parse(RAW_BODY) },
    result,
  );
});

test("getUserMessage()", (t) => {
  const payload = {
    messages: [
      {
        content: "Some previous message",
      },
      {
        content: "Hello, world!",
      },
    ],
  };
  const result = getUserMessage(payload);
  t.is("Hello, world!", result);
});

test("getUserConfirmation()", (t) => {
  const payload = {
    messages: [
      {
        content: "Some previous message",
      },
      {
        content: "Hello, world!",
        copilot_confirmations: [
          {
            state: "accepted",
            confirmation: {
              id: "some-confirmation-id",
              someConfirmationMetadata: "value",
            },
          },
        ],
      },
    ],
  };
  const result = getUserConfirmation(payload);
  t.deepEqual(
    {
      accepted: true,
      id: "some-confirmation-id",
      metadata: { someConfirmationMetadata: "value" },
    },
    result,
  );
});
