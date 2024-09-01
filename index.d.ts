import { request } from "@octokit/request";

// verification types

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

// response types

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

// parse types

export interface CopilotRequestPayload {
  copilot_thread_id: string
  messages: Message[]
  stop: any
  top_p: number
  temperature: number
  max_tokens: number
  presence_penalty: number
  frequency_penalty: number
  copilot_skills: any[]
  agent: string
}

export interface OpenAICompatibilityPayload {
  messages: {
    role: string
    name?: string
    content: string
  }[]
}

export interface Message {
  role: string
  content: string
  copilot_references: MessageCopilotReference[]
  copilot_confirmations?: MessageCopilotConfirmation[]
  name?: string
}

export interface MessageCopilotReference {
  type: string
  data: CopilotReferenceData
  id: string
  is_implicit: boolean
  metadata: CopilotReferenceMetadata
}

export interface CopilotReferenceData {
  type: string
  id: number
  name?: string
  ownerLogin?: string
  ownerType?: string
  readmePath?: string
  description?: string
  commitOID?: string
  ref?: string
  refInfo?: CopilotReferenceDataRefInfo
  visibility?: string
  languages?: CopilotReferenceDataLanguage[]
  login?: string
  avatarURL?: string
  url?: string
}

export interface CopilotReferenceDataRefInfo {
  name: string
  type: string
}

export interface CopilotReferenceDataLanguage {
  name: string
  percent: number
}

export interface CopilotReferenceMetadata {
  display_name: string
  display_icon: string
  display_url: string
}

export interface MessageCopilotConfirmation {
  state: "dismissed" | "accepted"
  confirmation: {
    id: string
    [key: string]: unknown
  }
}

export interface ParseRequestBodyInterface {
  (body: string): CopilotRequestPayload
}

export interface TransformPayloadForOpenAICompatibilityInterface {
  (payload: CopilotRequestPayload): OpenAICompatibilityPayload
}


export interface VerifyAndParseRequestInterface {
  (
    body: string,
    signature: string,
    keyID: string,
    requestOptions?: RequestOptions,
  ): Promise<{ isValidRequest: boolean; payload: CopilotRequestPayload }>;
}


export interface GetUserMessageInterface {
  (payload: CopilotRequestPayload): string;
}

export type UserConfirmation = {
  accepted: boolean;
  id?: string;
  metadata: Record<string, unknown>;
}

export interface GetUserConfirmationInterface {
  (payload: CopilotRequestPayload): UserConfirmation | undefined;
}

// exported methods

export declare const verifyRequest: VerifyRequestInterface;
export declare const fetchVerificationKeys: FetchVerificationKeysInterface;
export declare const verifyRequestByKeyId: VerifyRequestByKeyIdInterface;

export declare const createAckEvent: CreateAckEventInterface;
export declare const createConfirmationEvent: CreateConfirmationEventInterface;
export declare const createDoneEvent: CreateDoneEventInterface;
export declare const createErrorsEvent: CreateErrorsEventInterface;
export declare const createReferencesEvent: CreateReferencesEventInterface;
export declare const createTextEvent: CreateTextEventInterface;

export declare const parseRequestBody: ParseRequestBodyInterface;
export declare const transformPayloadForOpenAICompatibility: TransformPayloadForOpenAICompatibilityInterface;
export declare const verifyAndParseRequest: VerifyAndParseRequestInterface;
export declare const getUserMessage: GetUserMessageInterface;
export declare const getUserConfirmation: GetUserConfirmationInterface;