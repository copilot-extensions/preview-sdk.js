import { expectType } from "tsd";
import { request } from "@octokit/request";

import {
  fetchVerificationKeys,
  verifyRequest,
  verifyRequestByKeyId,
  type VerificationPublicKey,
} from "./index.js";

const rawBody = "";
const signature = "";
const keyId = "";
const key = ""
const token = "";

export async function verifyRequestByKeyIdTest() {
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

export async function verifyRequestTest() {
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