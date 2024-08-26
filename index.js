// @ts-check

import { createVerify } from "node:crypto";

import { request as defaultRequest } from "@octokit/request";
import { RequestError } from "@octokit/request-error";

/** @type {import('.').VerifyInterface} */
export async function verify(
  rawBody,
  signature,
  keyId,
  { token = "", request = defaultRequest } = { request: defaultRequest },
) {
  // verify arguments
  assertValidString(rawBody, "Invalid payload");
  assertValidString(signature, "Invalid signature");
  assertValidString(keyId, "Invalid keyId");

  // receive valid public keys from GitHub
  const requestOptions = request.endpoint("GET /meta/public_keys/copilot_api", {
    headers: token
      ? {
          Authorization: `token ${token}`,
        }
      : {},
  });
  const response = await request(requestOptions);
  const { data: keys } = response;

  // verify provided key Id
  const publicKey = keys.public_keys.find(
    (key) => key.key_identifier === keyId,
  );
  if (!publicKey) {
    throw new RequestError(
      "[@copilot-extensions/preview-sdk] No public key found matching key identifier",
      404,
      {
        request: requestOptions,
        response,
      },
    );
  }

  const verify = createVerify("SHA256").update(rawBody);

  // verify signature
  return verify.verify(publicKey.key, signature, "base64");
}

function assertValidString(value, message) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`[@copilot-extensions/preview-sdk] ${message}`);
  }
}
