import { test } from "node:test";
import assert from "node:assert/strict";

import { request as defaultRequest } from "@octokit/request";
import { MockAgent } from "undici";

import {
  fetchVerificationKeys,
  verifyRequest,
  verifyRequestByKeyId,
} from "../index.js";

export const RAW_BODY = `{"copilot_thread_id":"9a1cc23a-ab73-498b-87a5-96c94cb7e3f3","messages":[{"role":"user","content":"@gr2m hi","copilot_references":[{"type":"github.repository","data":{"type":"repository","id":102985470,"name":"sandbox","ownerLogin":"gr2m","ownerType":"User","readmePath":"README.md","description":"@gr2m's little sandbox to play","commitOID":"9b04fffccbb818b2e317394463731b66f1ec5e89","ref":"refs/heads/main","refInfo":{"name":"main","type":"branch"},"visibility":"public","languages":[{"name":"JavaScript","percent":100}]},"id":"gr2m/sandbox","is_implicit":false,"metadata":{"display_name":"gr2m/sandbox","display_icon":"","display_url":""}}],"copilot_confirmations":null},{"role":"user","content":"@gr2m test","copilot_references":[{"type":"github.repository","data":{"type":"repository","id":102985470,"name":"sandbox","ownerLogin":"gr2m","ownerType":"User","readmePath":"README.md","description":"@gr2m's little sandbox to play","commitOID":"9b04fffccbb818b2e317394463731b66f1ec5e89","ref":"refs/heads/main","refInfo":{"name":"main","type":"branch"},"visibility":"public","languages":[{"name":"JavaScript","percent":100}]},"id":"gr2m/sandbox","is_implicit":false,"metadata":{"display_name":"gr2m/sandbox","display_icon":"","display_url":""}}],"copilot_confirmations":null},{"role":"user","content":"@gr2m test","copilot_references":[{"type":"github.repository","data":{"type":"repository","id":102985470,"name":"sandbox","ownerLogin":"gr2m","ownerType":"User","readmePath":"README.md","description":"@gr2m's little sandbox to play","commitOID":"9b04fffccbb818b2e317394463731b66f1ec5e89","ref":"refs/heads/main","refInfo":{"name":"main","type":"branch"},"visibility":"public","languages":[{"name":"JavaScript","percent":100}]},"id":"gr2m/sandbox","is_implicit":false,"metadata":{"display_name":"gr2m/sandbox","display_icon":"","display_url":""}}],"copilot_confirmations":null},{"role":"user","content":"Current Date and Time (UTC): 2024-08-26 19:43:13\\nUser's Current URL: https://github.com/gr2m/sandbox\\nCurrent User's Login: gr2m\\n","name":"_session","copilot_references":[],"copilot_confirmations":null},{"role":"user","content":"","copilot_references":[{"type":"github.repository","data":{"type":"repository","id":102985470,"name":"sandbox","ownerLogin":"gr2m","ownerType":"User","readmePath":"README.md","description":"@gr2m's little sandbox to play","commitOID":"9b04fffccbb818b2e317394463731b66f1ec5e89","ref":"refs/heads/main","refInfo":{"name":"main","type":"branch"},"visibility":"public","languages":[{"name":"JavaScript","percent":100}]},"id":"gr2m/sandbox","is_implicit":false,"metadata":{"display_name":"gr2m/sandbox","display_icon":"","display_url":""}}],"copilot_confirmations":null},{"role":"user","content":"test","copilot_references":[],"copilot_confirmations":[]}],"stop":null,"top_p":0,"temperature":0,"max_tokens":0,"presence_penalty":0,"frequency_penalty":0,"copilot_skills":null,"agent":"gr2m"}`;
export const KEY_ID =
  "4fe6b016179b74078ade7581abf4e84fb398c6fae4fb973972235b84fcd70ca3";

export const CURRENT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAELPuPiLVQbHY/clvpNnY+0BzYIXgo
S0+XhEkTWUZEEznIVpS3rQseDTG6//gEWr4j9fY35+dGOxwOx3Z9mK3i7w==
-----END PUBLIC KEY-----
`;

export const SIGNATURE =
  "MEYCIQC8aEmkYA/4EQrXEOi2OL9nfpbnrCxkMc6HrH7b6SogKgIhAIYBThcpzkCCswiV1+pOaPI+zFQF9ShG61puoKs9rJjq";

test("smoke", (t) => {
  assert.equal(typeof verifyRequestByKeyId, "function");
});

test("verifyRequestByKeyId()", async (t) => {
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

  const result = await verifyRequestByKeyId(RAW_BODY, SIGNATURE, KEY_ID, {
    request: testRequest,
  });

  assert.deepEqual(result, true);
});

test("verifyRequestByKeyId() - invalid arguments", (t) => {
  assert.rejects(verifyRequestByKeyId(RAW_BODY, SIGNATURE), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  assert.rejects(verifyRequestByKeyId("", SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  assert.rejects(verifyRequestByKeyId(1, SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  assert.rejects(verifyRequestByKeyId(undefined, SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, "", KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, 1, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, undefined, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, SIGNATURE, ""), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, SIGNATURE, 1), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  assert.rejects(verifyRequestByKeyId(RAW_BODY, SIGNATURE, undefined), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });
});

test("verifyRequest() - valid", async (t) => {
  const result = await verifyRequest(RAW_BODY, SIGNATURE, CURRENT_PUBLIC_KEY);
  assert.deepEqual(result, true);
});

test("verifyRequest() - invalid", async (t) => {
  const result = await verifyRequest(RAW_BODY, SIGNATURE, "invalid-key");
  assert.deepEqual(result, false);
});

test("fetchVerificationKeys()", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  const publicKeys = [
    {
      key: "<key 1>",
      key_identifier: "<key-id 1>",
      is_current: true,
    },
    {
      key: "<key 2>",
      key_identifier: "<key-id 2>",
      is_current: true,
    },
  ];

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
        public_keys: publicKeys,
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

  const result = await fetchVerificationKeys({
    request: testRequest,
  });

  assert.deepEqual(result, publicKeys);
});
