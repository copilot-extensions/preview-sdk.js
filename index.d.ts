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
    delta: InteropMessage<"assistant">
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
    delta: InteropMessage<"assistant">
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
  messages: CopilotMessage[]
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
  messages: InteropMessage[]
}

export interface CopilotMessage {
  role: string
  content: string
  copilot_references: MessageCopilotReference[]
  copilot_confirmations?: MessageCopilotConfirmation[]
  tool_calls?: {
    "function": {
      "arguments": string,
      "name": string
    },
    "id": string,
    "type": "function"
  }[]
  name?: string
  [key: string]: unknown
}

export interface InteropMessage<TRole extends string = string> {
  role: TRole
  content: string
  name?: string
  [key: string]: unknown
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

// prompt

/** 
 * model names supported by Copilot API
 * 
 * Based on https://api.githubcopilot.com/models from 2024-09-02
 */
export type ModelName =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-4"
  | "gpt-4-0613"
  | "gpt-4-o-preview"
  | "gpt-4o"
  | "gpt-4o-2024-05-13"
  | "text-embedding-3-small"
  | "text-embedding-3-small-inference"
  | "text-embedding-ada-002"
  | "text-embedding-ada-002-index"

export interface PromptFunction {
  type: "function"
  function: {
    name: string;
    description?: string;
    /** @see https://platform.openai.com/docs/guides/structured-outputs/supported-schemas */
    parameters?: Record<string, unknown>;
    strict?: boolean | null;
  }
}

export type PromptOptions = {
  model: ModelName
  token: string
  tools?: PromptFunction[]
  messages?: InteropMessage[]
  request?: {
    fetch?: Function
  }
}

export type PromptResult = {
  requestId: string
  message: CopilotMessage
}

// https://stackoverflow.com/a/69328045
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

interface PromptInterface {
  (userPrompt: string, options: PromptOptions): Promise<PromptResult>;
  (options: WithRequired<PromptOptions, "messages">): Promise<PromptResult>;
}

interface GetFunctionCallsInterface {
  (payload: PromptResult): {
    id: string;
    function: {
      name: string,
      arguments: string,
    }
  }[]
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

export declare const prompt: PromptInterface;
export declare const getFunctionCalls: GetFunctionCallsInterface;