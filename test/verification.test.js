import test from "ava";

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

export const publicKeys = [
  {
    key: CURRENT_PUBLIC_KEY,
    key_identifier: KEY_ID,
    is_current: true,
  },
];

test("smoke", (t) => {
  t.is(typeof verifyRequestByKeyId, "function");
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

  const result = await verifyRequestByKeyId(RAW_BODY, SIGNATURE, KEY_ID, {
    request: testRequest,
  });

  t.deepEqual(result, { isValid: true, cache: { id: "", keys: publicKeys } });
});

test("verifyRequestByKeyId() - throws if keyId not present in verification keys list", async (t) => {
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

  await t.throwsAsync(
    verifyRequestByKeyId(RAW_BODY, SIGNATURE, "wrong_key", {
      request: testRequest,
    }),
    {
      name: "Error",
      message:
        "[@copilot-extensions/preview-sdk] No public key found matching key identifier",
    },
  );
});

test("verifyRequestByKeyId() - invalid arguments", async (t) => {
  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, SIGNATURE), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  t.throwsAsync(verifyRequestByKeyId("", SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  t.throwsAsync(verifyRequestByKeyId(1, SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  t.throwsAsync(verifyRequestByKeyId(undefined, SIGNATURE, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid payload",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, "", KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, 1, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, undefined, KEY_ID), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid signature",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, SIGNATURE, ""), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, SIGNATURE, 1), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });

  t.throwsAsync(verifyRequestByKeyId(RAW_BODY, SIGNATURE, undefined), {
    name: "Error",
    message: "[@copilot-extensions/preview-sdk] Invalid keyId",
  });
});

test("verifyRequest() - valid", async (t) => {
  const result = await verifyRequest(RAW_BODY, SIGNATURE, CURRENT_PUBLIC_KEY);
  t.deepEqual(result, true);
});

test("verifyRequest() - invalid", async (t) => {
  const result = await verifyRequest(RAW_BODY, SIGNATURE, "invalid-key");
  t.deepEqual(result, false);
});

test("fetchVerificationKeys() - without cache", async (t) => {
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

  t.deepEqual(result, { id: "", keys: publicKeys });
});

test("fetchVerificationKeys() - returns cached keys on 304 response", async (t) => {
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
      304,
      {},
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

  const cache = {
    id: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
    keys: publicKeys,
  };

  const result = await fetchVerificationKeys({
    request: testRequest,
    cache,
  });

  t.deepEqual(result, cache);
});

test("fetchVerificationKeys() - throws on non-ok response", async (t) => {
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
    .replyWithError(
      new Error("Request failed with status code 500"),
    );
  const testRequest = defaultRequest.defaults({
    request: { fetch: fetchMock },
  });

  const cache = {
    id: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
    keys: publicKeys,
  };

  await t.throwsAsync(fetchVerificationKeys({
    request: testRequest,
    cache,
  }),{
    message: "Request failed with status code 500",
  });
});

test("fetchVerificationKeys() - populates and utilizes cache correctly", async (t) => {
  const mockAgent = new MockAgent();
  function fetchMock(url, opts) {
    opts ||= {};
    opts.dispatcher = mockAgent;
    return fetch(url, opts);
  }

  mockAgent.disableNetConnect();
  const mockPool = mockAgent.get("https://api.github.com");

  // First request: respond with 200 and etag header
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
          etag: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
          "x-request-id": "<request-id>",
        },
      },
    );

  const testRequest = defaultRequest.defaults({
    request: { fetch: fetchMock },
  });

  // First call to fetchVerificationKeys to populate the cache
  const firstResult = await fetchVerificationKeys({
    request: testRequest,
  });

  const expectedCache = {
    id: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
    keys: publicKeys,
  };
  t.deepEqual(firstResult, expectedCache);

  // Second request: respond with 304
  mockPool
    .intercept({
      method: "get",
      path: `/meta/public_keys/copilot_api`,
    })
    .reply(
      304,
      {},
      {
        headers: {
          "content-type": "application/json",
          "x-request-id": "<request-id>",
        },
      },
    );

  // Second call to fetchVerificationKeys with cache
  const secondResult = await fetchVerificationKeys({
    request: testRequest,
    cache: expectedCache,
  });

  t.deepEqual(secondResult, expectedCache);
});

test("fetchVerificationKeys() - with token", async (t) => {
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
  const token = "secr3t";
  mockPool
    .intercept({
      method: "get",
      path: `/meta/public_keys/copilot_api`,
      headers: {
        Authorization: `token ${token}`,
      },
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
          etag: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
        },
      },
    );
  const testRequest = defaultRequest.defaults({
    request: { fetch: fetchMock },
  });

  const result = await fetchVerificationKeys({
    token,
    request: testRequest,
  });

  t.deepEqual(result, {
    id: 'W/"db60f89fb432b6c2362ac024c9322df5e6e2a8326595f7c1d35f807767d66e85"',
    keys: [
      {
        is_current: true,
        key: "<key 1>",
        key_identifier: "<key-id 1>",
      },
      {
        is_current: true,
        key: "<key 2>",
        key_identifier: "<key-id 2>",
      },
    ],
  });
});
