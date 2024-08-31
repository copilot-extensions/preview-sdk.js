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

export interface CreateAckEventInterface {
  (): ResponseEvent<"ack">
}

export interface CreateTextEventInterface {
  (message: string): ResponseEvent<"text">
}

export type CreateConfirmationEventOptions = { id: string, title: string, message: string, metadata?: Record<string, unknown> }

export interface CreateConfirmationEventInterface {
  (options: CreateConfirmationEventOptions): ResponseEvent<"copilot_confirmation">
}
export interface CreateReferencesEventInterface {
  (references: CopilotReference[]): ResponseEvent<"copilot_references">
}
export interface CreateErrorsEventInterface {
  (errors: CopilotError[]): ResponseEvent<"copilot_errors">
}
export interface CreateDoneEventInterface {
  (): ResponseEvent<"done">
}

type ResponseEventType = "ack" | "done" | "text" | "copilot_references" | "copilot_confirmation" | "copilot_errors"
type EventsWithoutEventKey = "ack" | "done" | "text"
type ResponseEvent<T extends ResponseEventType = "text"> =
  T extends EventsWithoutEventKey ? {
    data: T extends "ack" ? CopilotAckResponseEventData : T extends "done" ? CopilotDoneResponseEventData : T extends "text" ? CopilotTextResponseEventData : never
    toString: () => string
  } : {
    event: T
    data: T extends "copilot_references" ? CopilotReferenceResponseEventData : T extends "copilot_confirmation" ? CopilotConfirmationResponseEventData : T extends "copilot_errors" ? CopilotErrorsResponseEventData : never
    toString: () => string
  }

type CopilotAckResponseEventData = {
  choices: [{
    delta: {
      content: "", role: "assistant"
    }
  }]
}

type CopilotDoneResponseEventData = {
  choices: [{
    finish_reason: "stop"
    delta: {
      content: null
    }
  }]
}

type CopilotTextResponseEventData = {
  choices: [{
    delta: {
      content: string, role: "assistant"
    }
  }]
}
type CopilotConfirmationResponseEventData = {
  type: 'action';
  title: string;
  message: string;
  confirmation?: {
    id: string;
    [key: string]: any;
  };
}
type CopilotErrorsResponseEventData = CopilotError[]
type CopilotReferenceResponseEventData = CopilotReference[]

type CopilotError = {
  type: "reference" | "function" | "agent";
  code: string;
  message: string;
  identifier: string;
}

interface CopilotReference {
  type: string;
  id: string;
  data?: {
    [key: string]: unknown;
  };
  is_implicit?: boolean;
  metadata?: {
    display_name: string;
    display_icon?: string;
    display_url?: string;
  };
}

export declare const verifyRequest: VerifyRequestInterface;
export declare const fetchVerificationKeys: FetchVerificationKeysInterface;
export declare const verifyRequestByKeyId: VerifyRequestByKeyIdInterface;

export declare const createAckEvent: CreateAckEventInterface;
export declare const createConfirmationEvent: CreateConfirmationEventInterface;
export declare const createDoneEvent: CreateDoneEventInterface;
export declare const createErrorsEvent: CreateErrorsEventInterface;
export declare const createReferencesEvent: CreateReferencesEventInterface;
export declare const createTextEvent: CreateTextEventInterface;
