import { expectType } from "tsd";
import { request } from "@octokit/request";

import { verify } from "./index.js";

const rawBody = "";
const signature = "";
const keyId = "";
const token = "";

export async function verifyTest() {
  const result = await verify(rawBody, signature, keyId);
  expectType<boolean>(result);

  // @ts-expect-error - first 3 arguments are required
  verify(rawBody, signature);

  // @ts-expect-error - rawBody must be a string
  await verify(1, signature, keyId);

  // @ts-expect-error - signature must be a string
  await verify(rawBody, 1, keyId);

  // @ts-expect-error - keyId must be a string
  await verify(rawBody, signature, 1);

  // accepts a token argument
  await verify(rawBody, signature, keyId, { token });

  // accepts a request argument
  await verify(rawBody, signature, keyId, { request });
}
