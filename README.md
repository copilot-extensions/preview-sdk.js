# Preview SDK

This SDK simplifies the process of building an GitHub Copilot Extension as an agent. Building Copilot Extensions previously required manual handling of request verification, response formatting, and API interactions. This SDK simplifies these tasks, allowing you to focus on your extension's core functionality rather than building boilerplate code. Use it to integrate your tools, APIs, or data sources directly into Copilot Chat.

We consider this SDK alpha software in terms of API stability, but we adhere to semantic-versioning, so it's safe to use today.

> Note: This SDK does not apply to skillset extensions. It only applies to developing an agent extension. For more info, see the [docs on skillsets and agents](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions#about-skillsets-and-agents).

## Key features

- Request payload verification
- Payload parsing
- Response building

## Benefits

- Handles security and response formatting requirements
- Provides utilities for common extension tasks
- Streamlines the development process

## Usage

### Verify a request

```js
import { verifyRequestByKeyId } from "@copilot-extensions/preview-sdk";

const { isValid, cache } = await verifyRequestByKeyId(
  request.body,
  signature,
  keyId,
  {
    token: process.env.GITHUB_TOKEN,
  },
);
// isValid: true or false
// cache: { id, keys }
```

### Build a response

```js
import { createAckEvent, createDoneEvent, createTextEvent } from "@copilot-extensions/preview-sdk";

export default handler(request, response) {
  const ackEvent = createAckEvent();
  const textEvent = createTextEvent("Hello, world!");
  const doneEvent = createDoneEvent();

  response.write(ackEvent);
  response.write(textEvent);
  response.end(doneEvent);
}
```

### Send a custom prompt

```js
import { prompt } from "@copilot-extensions/preview-sdk";

try {
  const { message } = await prompt("What is the capital of France?", {
    token: process.env.TOKEN,
  });

  console.log(message.content);
} catch (error) {
  console.error(error);
}
```

## API

### Verification

<a name=verifyRequestByKeyId></a>

#### `async verifyRequestByKeyId(rawBody, signature, keyId, requestOptions)`

Verify the request payload using the provided signature and key ID. The method will request the public key from GitHub's API for the given keyId and then verify the payload.

The `requestOptions` argument is optional. It can contain:

- a `token` to authenticate the request to GitHub's API
- a custom [octokit `request`](https://github.com/octokit/request.js) instance to use for the request
- a `cache` to use cached keys

```js
import { verifyRequestByKeyId } from "@copilot-extensions/preview-sdk";

const { isValid, cache } = await verifyRequestByKeyId(
  request.body,
  signature,
  keyId,
);

// with token
const { isValid, cache } = await verifyRequestByKeyId(
  request.body,
  signature,
  keyId,
  { token: "ghp_1234" },
);

// with custom octokit request instance
const { isValid, cache } = await verifyRequestByKeyId(
  request.body,
  signature,
  keyId,
  { request },
);

// with cache
const previousCache = {
  id: "etag_value",
  keys: [{ key_identifier: "key1", key: "public_key1", is_current: true }],
};
const { isValid, cache } = await verifyRequestByKeyId(
  request.body,
  signature,
  keyId,
  { cache: previousCache },
);
```

#### `async fetchVerificationKeys(options)`

Fetches public keys for verifying copilot extension requests [from GitHub's API](https://api.github.com/meta/public_keys/copilot_api) and returns them as an array. The request can be made without authentication, with a token, with a custom [octokit request](https://github.com/octokit/request.js) instance, or with a cache.

```js
import { fetchVerificationKeys } from "@copilot-extensions/preview-sdk";

// fetch without authentication
const { id, keys } = await fetchVerificationKeys();

// with token
const { id, keys } = await fetchVerificationKeys({ token: "ghp_1234" });

// with custom octokit request instance
const { id, keys } = await fetchVerificationKeys({ request });

// with cache
const cache = {
  id: "etag_value",
  keys: [{ key_identifier: "key1", key: "public_key1" }],
};
const { id, keys } = await fetchVerificationKeys({ cache });
```

#### `async verifyRequest(rawBody, signature, keyId)`

Verify the request payload using the provided signature and key. Note that the raw body as received by GitHub must be passed, before any parsing.

```js
import { verify } from "@copilot-extensions/preview-sdk";

const payloadIsVerified = await verifyRequest(request.body, signature, key);
// true or false
```

### Response

All `create*Event()` methods return a string that can directly be written to the response stream.

#### `createAckEvent()`

Acknowledge the request so that the chat UI can tell the user that the agent started generating a response.
The `ack` event should only be sent once.

```js
import { createAckEvent } from "@copilot-extensions/preview-sdk";

response.write(createAckEvent());
```

#### `createTextEvent(message)`

Send a text message to the chat UI. Multiple messages can be sent. The `message` argument must be a string and may include markdown.

```js
import { createTextEvent } from "@copilot-extensions/preview-sdk";

response.write(createTextEvent("Hello, world!"));
response.write(createTextEvent("Hello, again!"));
```

#### `createConfirmationEvent({ id, title, message, metadata })`

Ask the user to confirm an action. The `confirmation` event should only be sent once.

The `meta` data object will be sent along the user's response.

See additional documentation about [Copilot confirmations](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-the-copilot-platform#copilot_confirmation).

```js
import { createConfirmationEvent } from "@copilot-extensions/preview-sdk";

response.write(
  createConfirmationEvent({
    id: "123",
    title: "Are you sure?",
    message: "This will do something.",
  }),
);
```

#### `createReferencesEvent(references)`

Send a list of references to the chat UI. The `references` argument must be an array of objects with the following properties:

- `id`
- `type`

The following properties are optional

- `data`: object with any properties
- `is_implicit`: a boolean
- `metadata`: an object with a required `display_name` and the optional properties: `display_icon` and `display_url`

Multiple `references` events can be sent.

See additional documentation about [Copilot references](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-the-copilot-platform#copilot_references).

```js
import { createReferencesEvent } from "@copilot-extensions/preview-sdk";

response.write(
  createReferencesEvent([
    {
      id: "123",
      type: "issue",
      data: {
        number: 123,
      },
      is_implicit: false,
      metadata: {
        display_name: "My issue",
        display_icon: "issue-opened",
        display_url: "https://github.com/monalisa/hello-world/issues/123",
    },
  ])
);
```

#### `createErrorsEvent(errors)`

An array of objects with the following properties:

- `type`: must be one of: `"reference"`, `"function"`, `"agent"`
- `code`
- `message`
- `identifier`

See additional documentation about [Copilot errors](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-the-copilot-platform#copilot_errors).

#### `createDoneEvent()`

The `done` event should only be sent once, at the end of the response. No further events can be sent after the `done` event.

```js
import { createDoneEvent } from "@copilot-extensions/preview-sdk";

response.write(createDoneEvent());
```

### Parsing

<a name="parseRequestBody"></a>

#### `parseRequestBody(body)`

Parses the raw request body and returns an object with type support.

⚠️ **It's well possible that the type is not 100% correct. Please send pull requests to `index.d.ts` to improve it**

```js
import { parseRequestBody } from "@copilot-extensions/preview-sdk";

const payload = parseRequestBody(rawBody);
// When your IDE supports types, typing "payload." should prompt the available keys and their types.
```

#### `transformPayloadForOpenAICompatibility()`

For cases when you want to pipe a user request directly to OpenAI, use this method to remove Copilot-specific fields from the request payload.

```js
import { transformPayloadForOpenAICompatibility } from "@copilot-extensions/preview-sdk";
import { OpenAI } from "openai";

const openaiPayload = transformPayloadForOpenAICompatibility(payload);

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const stream = openai.beta.chat.completions.stream({
  ...openaiPayload,
  model: "gpt-4-1106-preview",
  stream: true,
});
```

#### `verifyAndParseRequest()`

Convenience method to verify and parse a request in one go. It calls [`verifyRequestByKeyId()`](#verifyRequestByKeyId) and [`parseRequestBody()`](#parseRequestBody) internally.

```js
import { verifyAndParseRequest } from "@copilot-extensions/preview-sdk";

const { isValidRequest, payload, cache } = await verifyAndParseRequest(
  request.body,
  signature,
  keyId,
  {
    token: process.env.GITHUB_TOKEN,
  },
);

if (!isValidRequest) {
  throw new Error("Request could not be verified");
}

// `isValidRequest` is a boolean.
// `payload` has type support.
// `cache` contains the id and keys used for verification.
```

#### `getUserMessage()`

Convenience method to get the user's message from the request payload.

```js
import { getUserMessage } from "@copilot-extensions/preview-sdk";

const userMessage = getUserMessage(payload);
```

#### `getUserConfirmation()`

Convenience method to get the user's confirmation from the request payload (in case the user's last response was a confirmation).

```js
import { getUserConfirmation } from "@copilot-extensions/preview-sdk";

const userConfirmation = getUserConfirmation(payload);

if (userConfirmation) {
  console.log("Received a user confirmation", userConfirmation);
} else {
  // The user's last response was not a confirmation
}
```

## Prompt (Custom Chat completion calls)

#### `prompt(message, options)`

Send a prompt to the chat UI and receive a response from the user. The `message` argument must be a string and may include markdown.

The `options` argument is optional. It can contain a `token` to authenticate the request to GitHub's API, or a custom `request.fetch` instance to use for the request.

```js
import { prompt } from "@copilot-extensions/preview-sdk";

const { message } = await prompt("What is the capital of France?", {
  model: "gpt-4",
  token: process.env.TOKEN,
});

console.log(message.content);
```

In order to pass a history of messages, pass them as `options.messages`:

```js
const { message } = await prompt("What about Spain?", {
  model: "gpt-4",
  token: process.env.TOKEN,
  messages: [
    { role: "user", content: "What is the capital of France?" },
    { role: "assistant", content: "The capital of France is Paris." },
  ],
});
```

Alternatively, skip the `message` argument and pass all messages as `options.messages`:

```js
const { message } = await prompt({
  model: "gpt-4",
  token: process.env.TOKEN,
  messages: [
    { role: "user", content: "What is the capital of France?" },
    { role: "assistant", content: "The capital of France is Paris." },
    { role: "user", content: "What about Spain?" },
  ],
});
```

⚠️ Not all of the arguments below are implemented yet. See [#5](https://github.com/copilot-extensions/preview-sdk.js/issues/5) sub issues for progress.

```js
await prompt({
  model: "gpt-4o",
  token: process.env.TOKEN,
  system: "You are a helpful assistant.",
  messages: [
    { role: "user", content: "What is the capital of France?" },
    { role: "assistant", content: "The capital of France is Paris." },
    {
      role: "user",
      content: [
        [
          { type: "text", text: "What about this country?" },
          {
            type: "image_url",
            image_url: urlToImageOfFlagOfSpain,
          },
        ],
      ],
    },
  ],
  // GitHub recommends using your GitHub username, the name of your application
  // https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28#user-agent
  userAgent: "gr2m/my-app v1.2.3",
  // set an alternative chat completions endpoint
  endpoint: "https://models.inference.ai.azure.com/chat/completions",
  // compare https://platform.openai.com/docs/guides/function-calling/configuring-function-calling-behavior-using-the-tool_choice-parameter
  toolChoice: "auto",
  tools: [
    {
      type: "function",
      function: {
        name: "get_weather",
        strict: true,
        parameters: {
          type: "object",
          properties: {
            location: { type: "string" },
            unit: { type: "string", enum: ["c", "f"] },
          },
          required: ["location", "unit"],
          additionalProperties: false,
        },
      },
    },
  ],
  // configuration related to the request transport layer
  request: {
    // for mocking, proxying, client certificates, etc.
    fetch: myCustomFetch,
    // hook into request life cycle for complex authentication strategies, retries, throttling, etc
    // compare options.request.hook from https://github.com/octokit/request.js
    hook: myCustomHook,
    // Use an `AbortController` instance to cancel a request
    signal: myAbortController.signal,
  },
});
```

#### `prompt.stream(message, options)`

Works the same way as `prompt()`, but resolves with a `stream` key instead of a `message` key.

```js
import { prompt } from "@copilot-extensions/preview-sdk";

const { requestId, stream } = await prompt.stream("What is the capital of France?", {
  token: process.env.TOKEN,
});

for await (const chunk of stream) {
  console.log(new TextDecoder().decode(chunk));
}
```

### `getFunctionCalls()`

Convenience metthod if a result from a `prompt()` call includes function calls.

```js
import { prompt, getFunctionCalls } from "@copilot-extensions/preview-sdk";

const result = await prompt(options);
const [functionCall] = getFunctionCalls(result);

if (functionCall) {
  console.log("Received a function call", functionCall);
} else {
  console.log("No function call received");
}
```

## Copilot Extensions Documentation

- [Using Copilot Extensions](https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat)
- [About building Copilot Extensions](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions)
- [Set up process](https://docs.github.com/en/copilot/building-copilot-extensions/setting-up-copilot-extensions)
- [Communicating with the Copilot platform](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-the-copilot-platform)
- [Communicating with GitHub](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-github)

## Dreamcode

While implementing the lower-level functionality, we also dream big: what would our dream SDK for Coplitot extensions look like? Please have a look and share your thoughts and ideas:

[dreamcode.md](./dreamcode.md)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
