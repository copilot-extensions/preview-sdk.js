// @ts-check

import { createVerify } from "node:crypto";

import { request as defaultRequest } from "@octokit/request";

/** @type {import('..').VerifyRequestByKeyIdInterface} */
export async function verifyRequest(rawBody, signature, key) {
  // verify arguments
  assertValidString(rawBody, "Invalid payload");
  assertValidString(signature, "Invalid signature");
  assertValidString(key, "Invalid key");

  // verify signature
  try {
    return createVerify("SHA256")
      .update(rawBody)
      .verify(key, signature, "base64");
  } catch {
    return false;
  }
}

/** @type {import('..').FetchVerificationKeysInterface} */
export async function fetchVerificationKeys(
  { token = "", request = defaultRequest } = { request: defaultRequest }
) {
  const { data } = await request("GET /meta/public_keys/copilot_api", {
    headers: token
      ? {
          Authorization: `token ${token}`,
        }
      : {},
  });

  return data.public_keys;
}

/** @type {import('..').VerifyRequestByKeyIdInterface} */
export async function verifyRequestByKeyId(
  rawBody,
  signature,
  keyId,
  requestOptions
) {
  // verify arguments
  assertValidString(rawBody, "Invalid payload");
  assertValidString(signature, "Invalid signature");
  assertValidString(keyId, "Invalid keyId");

  // receive valid public keys from GitHub
  const keys = await fetchVerificationKeys(requestOptions);

  // verify provided key Id
  const publicKey = keys.find((key) => key.key_identifier === keyId);

  if (!publicKey) {
    const keyNotFoundError = Object.assign(
      new Error(
        "[@copilot-extensions/preview-sdk] No public key found matching key identifier"
      ),
      {
        keyId,
        keys,
      }
    );
    throw keyNotFoundError;
  }

  return verifyRequest(rawBody, signature, publicKey.key);
}

function assertValidString(value, message) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`[@copilot-extensions/preview-sdk] ${message}`);
  }
}
