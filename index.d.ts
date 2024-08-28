import { request } from "@octokit/request";

type RequestInterface = typeof request;
type RequestOptions = {
  request?: RequestInterface;
  token?: string;
};
export type VerificationPublicKey = {
  key_identifier: string;
  key: string;
  is_current: boolean;
};

interface VerifyRequestInterface {
  (
    rawBody: string,
    signature: string,
    key: string
  ): Promise<boolean>;
}

interface FetchVerificationKeysInterface {
  (
    requestOptions?: RequestOptions,
  ): Promise<VerificationPublicKey[]>;
}

interface VerifyRequestByKeyIdInterface {
  (
    rawBody: string,
    signature: string,
    keyId: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
}

export declare const verifyRequest: VerifyRequestInterface;
export declare const fetchVerificationKeys: FetchVerificationKeysInterface;
export declare const verifyRequestByKeyId: VerifyRequestByKeyIdInterface;
