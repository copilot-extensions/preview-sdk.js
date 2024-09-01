// @ts-check

import { verifyRequestByKeyId } from "./verification.js";

/** @type {import('..').ParseRequestBodyInterface} */
export function parseRequestBody(body) {
  return JSON.parse(body);
}

/** @type {import('..').TransformPayloadForOpenAICompatibilityInterface} */
export function transformPayloadForOpenAICompatibility(payload) {
  return {
    messages: payload.messages.map((message) => {
      return {
        role: message.role,
        name: message.name,
        content: message.content,
      };
    }),
  };
}

/** @type {import('..').VerifyAndParseRequestInterface} */
export async function verifyAndParseRequest(body, signature, keyID, options) {
  const isValidRequest = await verifyRequestByKeyId(
    body,
    signature,
    keyID,
    options
  );

  return {
    isValidRequest,
    payload: parseRequestBody(body),
  };
}

/** @type {import('..').GetUserMessageInterface} */
export function getUserMessage(payload) {
  return payload.messages[payload.messages.length - 1].content;
}

/** @type {import('..').GetUserConfirmationInterface} */
export function getUserConfirmation(payload) {
  const confirmation =
    payload.messages[payload.messages.length - 1].copilot_confirmations?.[0];

  if (!confirmation) return;

  const { id, ...metadata } = confirmation.confirmation;

  return {
    accepted: confirmation.state === "accepted",
    id,
    metadata,
  };
}
