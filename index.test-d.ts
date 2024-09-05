import { expectType } from "tsd";
import { request } from "@octokit/request";

import {
  createAckEvent,
  createConfirmationEvent,
  createDoneEvent,
  createErrorsEvent,
  createReferencesEvent,
  createTextEvent,
  fetchVerificationKeys,
  verifyRequest,
  verifyRequestByKeyId,
  parseRequestBody,
  transformPayloadForOpenAICompatibility,
  verifyAndParseRequest,
  getUserMessage,
  getUserConfirmation,
  type VerificationPublicKey,
  type InteropMessage,
  CopilotRequestPayload,
  prompt,
  PromptResult,
  getFunctionCalls,
} from "./index.js";

const token = "";

export async function verifyRequestByKeyIdTest(
  rawBody: string,
  signature: string,
  keyId: string,
) {
  const result = await verifyRequestByKeyId(rawBody, signature, keyId);
  expectType<boolean>(result);

  // @ts-expect-error - first 3 arguments are required
  verifyRequestByKeyId(rawBody, signature);

  // @ts-expect-error - rawBody must be a string
  await verifyRequestByKeyId(1, signature, keyId);

  // @ts-expect-error - signature must be a string
  await verifyRequestByKeyId(rawBody, 1, keyId);

  // @ts-expect-error - keyId must be a string
  await verifyRequestByKeyId(rawBody, signature, 1);

  // accepts a token argument
  await verifyRequestByKeyId(rawBody, signature, keyId, { token });

  // accepts a request argument
  await verifyRequestByKeyId(rawBody, signature, keyId, { request });
}

export async function verifyRequestTest(
  rawBody: string,
  signature: string,
  key: string,
) {
  const result = await verifyRequest(rawBody, signature, key);
  expectType<boolean>(result);

  // @ts-expect-error - first 3 arguments are required
  verifyRequest(rawBody, signature);

  // @ts-expect-error - rawBody must be a string
  await verifyRequest(1, signature, key);

  // @ts-expect-error - signature must be a string
  await verifyRequest(rawBody, 1, key);

  // @ts-expect-error - key must be a string
  await verifyRequest(rawBody, signature, 1);
}

export async function fetchVerificationKeysTest() {
  const result = await fetchVerificationKeys();
  expectType<VerificationPublicKey[]>(result);

  // accepts a token argument
  await fetchVerificationKeys({ token });

  // accepts a request argument
  await fetchVerificationKeys({ request });
}

export function createAckEventTest() {
  const event = createAckEvent();
  expectType<string>(event);
}

export function createTextEventTest() {
  const event = createTextEvent("test");
  expectType<string>(event);
}

export function createConfirmationEventTest() {
  const event = createConfirmationEvent({
    id: "test",
    title: "test",
    message: "test",
  });
  expectType<string>(event);
}

export function createReferencesEventTest() {
  const event = createReferencesEvent([
    {
      type: "test.story",
      id: "test",
      data: {
        file: "test.js",
        start: "1",
        end: "42",
        content: "function test() {...}",
      },
      is_implicit: false,
      metadata: {
        display_name: "Lines 1-42 from test.js",
        display_icon: "test-icon",
        display_url:
          "http://github.com/monalisa/hello-world/blob/main/test.js#L1-L42",
      },
    },
  ]);
  expectType<string>(event);
}

export function createErrorsEventTest() {
  const event = createErrorsEvent([
    {
      type: "reference",
      code: "1",
      message: "test reference error",
      identifier: "reference-identifier",
    },
    {
      type: "function",
      code: "1",
      message: "test function error",
      identifier: "function-identifier",
    },
    {
      type: "agent",
      code: "1",
      message: "test agent error",
      identifier: "agent-identifier",
    },
  ]);
  expectType<string>(event);
}

export function createDoneEventTest() {
  const event = createDoneEvent();
  expectType<string>(event);
}

export function parseRequestBodyTest(body: string) {
  const result = parseRequestBody(body);
  expectType<CopilotRequestPayload>(result);
}

export function transformPayloadForOpenAICompatibilityTest(
  payload: CopilotRequestPayload,
) {
  const result = transformPayloadForOpenAICompatibility(payload);
  expectType<{
    messages: {
      content: string;
      role: string;
      name?: string;
      [key: string]: unknown;
    }[];
  }>(result);
}

export async function verifyAndParseRequestTest(
  rawBody: string,
  signature: string,
  keyId: string,
) {
  const result = await verifyAndParseRequest(rawBody, signature, keyId);
  expectType<{ isValidRequest: boolean; payload: CopilotRequestPayload }>(
    result,
  );
}

export function getUserMessageTest(payload: CopilotRequestPayload) {
  const result = getUserMessage(payload);
  expectType<string>(result);
}

export function getUserConfirmationTest(payload: CopilotRequestPayload) {
  const result = getUserConfirmation(payload);

  if (result === undefined) {
    expectType<undefined>(result);
    return;
  }

  expectType<{
    accepted: boolean;
    id?: string;
    metadata: Record<string, unknown>;
  }>(result);
}

export async function promptTest() {
  const result = await prompt("What is the capital of France?", {
    token: "secret",
  });

  expectType<string>(result.requestId);
  expectType<string>(result.message.content);

  // with custom fetch
  await prompt("What is the capital of France?", {
    token: "secret",
    request: {
      fetch: () => { },
    },
  });

  // @ts-expect-error - 2nd argument is required
  prompt("What is the capital of France?");

  // @ts-expect-error - token argument is required
  prompt("What is the capital of France?", { model: "" });
}

export async function promptWithToolsTest() {
  await prompt("What is the capital of France?", {
    token: "secret",
    tools: [
      {
        type: "function",
        function: {
          name: "",
          description: "",
          parameters: {},
          strict: true,
        },
      },
    ],
  });
}

export async function promptWithMessageAndMessages() {
  await prompt("What about Spain?", {
    model: "gpt-4",
    token: "secret",
    messages: [
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
    ],
  });
}

export async function promptWithoutMessageButMessages() {
  await prompt({
    model: "gpt-4",
    token: "secret",
    messages: [
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
      { role: "user", content: "What about Spain?" },
    ],
  });
}

export async function otherPromptOptionsTest() {
  const result = await prompt("What is the capital of France?", {
    token: "secret",
    model: "gpt-4",
    endpoint: "https://api.githubcopilot.com",
  });
}

export async function promptStreamTest() {
  const result = await prompt.stream("What is the capital of France?", {
    model: "gpt-4",
    token: "secret",
  });

  expectType<string>(result.requestId);
  expectType<ReadableStream<Uint8Array>>(result.stream);
}

export async function getFunctionCallsTest(
  promptResponsePayload: PromptResult,
) {
  const result = getFunctionCalls(promptResponsePayload);

  expectType<
    {
      id: string;
      function: {
        name: string;
        arguments: string;
      };
    }[]
  >(result);
}
