# `@copilot-extensions/preview-sdk`

> SDK for building GitHub Copilot Extensions

⚠️ **This SDK is a preview and subject to change**. We will however adhere to [semantic versioning](https://semver.org/), so it's save to use for early experimentation. Just beware there will be breaking changes. Best to watch this repository's releases for updates.

## Usage

### Verify a request

```js
import { verifyRequestByKeyId } from "@copilot-extensions/preview-sdk";

const payloadIsVerified = await verifyRequestByKeyId(
  request.body,
  signature,
  key,
  {
    token: process.env.GITHUB_TOKEN,
  }
);
// true or false
```

### Build a response

```js
import { createAckEvent, createDoneEvent, createTextEvent } from "@copilot-extensions/preview-sdk";

export default handler(request, response) {
  const ackEvent = createAckEvent();
  const textEvent = createTextEvent("Hello, world!");
  const doneEvent = createDoneEvent();

  response.write(ackEvent.toString());
  response.write(textEvent.toString());
  response.end(doneEvent.toString());
}
```

## API

### Verification

<a name=verifyRequestByKeyId></a>

#### `async verifyRequestByKeyId(rawBody, signature, keyId, requestOptions)`

Verify the request payload using the provided signature and key ID. The method will request the public key from GitHub's API for the given keyId and then verify the payload.

The `options` argument is optional. It can contain a `token` to authenticate the request to GitHub's API, or a custom `request` instance to use for the request.

```js
import { verifyRequestByKeyId } from "@copilot-extensions/preview-sdk";

const payloadIsVerified = await verifyRequestByKeyId(
  request.body,
  signature,
  key
);

// with token
await verifyRequestByKeyId(request.body, signature, key, { token: "ghp_1234" });

// with custom octokit request instance
await verifyRequestByKeyId(request.body, signature, key, { request });
```

#### `async fetchVerificationKeys(options)`

Fetches public keys for verifying copilot extension requests [from GitHub's API](https://api.github.com/meta/public_keys/copilot_api)
and returns them as an array. The request can be made without authentication, with a token, or with a custom [octokit request](https://github.com/octokit/request.js) instance.

```js
import { fetchVerificationKeys } from "@copilot-extensions/preview-sdk";

// fetch without authentication
const [current] = await fetchVerificationKeys();

// with token
const [current] = await fetchVerificationKeys({ token: "ghp_1234" });

// with custom octokit request instance
const [current] = await fetchVerificationKeys({ request });)
```

#### `async verifyRequestPayload(rawBody, signature, keyId)`

Verify the request payload using the provided signature and key. Note that the raw body as received by GitHub must be passed, before any parsing.

```js
import { verify } from "@copilot-extensions/preview-sdk";

const payloadIsVerified = await verifyRequestPayload(
  request.body,
  signature,
  key
);
// true or false
```

### Response

All `create*Event()` methods return an object with a `.toString()` method, which is called automatically when a string is expected. Unfortunately that's not the case for `response.write()`, you need to call `.toString()` explicitly.

#### `createAckEvent()`

Acknowledge the request so that the chat UI can tell the user that the agent started generating a response.
The `ack` event should only be sent once.

```js
import { createAckEvent } from "@copilot-extensions/preview-sdk";

response.write(createAckEvent().toString());
```

#### `createTextEvent(message)`

Send a text message to the chat UI. Multiple messages can be sent. The `message` argument must be a string and may include markdown.

```js
import { createTextEvent } from "@copilot-extensions/preview-sdk";

response.write(createTextEvent("Hello, world!").toString());
response.write(createTextEvent("Hello, again!").toString());
```

#### `createConfirmationEvent({ id, title, message, metadata })`

Ask the user to confirm an action. The `confirmation` event should only be sent once.

The `meta` data object will be sent along the user's response.

See additional documentation about Copilot confirmations at https://github.com/github/copilot-partners/blob/main/docs/confirmations.md.

```js
import { createConfirmationEvent } from "@copilot-extensions/preview-sdk";

response.write(
  createConfirmationEvent({
    id: "123",
    title: "Are you sure?",
    message: "This will do something.",
  }).toString()
);
```

#### `createReferencesEvent(references)`

Send a list of references to the chat UI. The `references` argument must be an array of objects with the following properties:

- `id`
- `type`

The following properties are optional

- `data`: object with any properties.
- `is_implicit`: a boolean
- `metadata`: an object with a required `display_name` and the optional properties: `display_icon` and `display_url`

Multiple `references` events can be sent.

See additional documentation about Copilot references at https://github.com/github/copilot-partners/blob/main/docs/copilot-references.md.

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
  ]).toString()
);
```

#### `createErrorsEvent(errors)`

An array of objects with the following properties:

- `type`: must be one of: `"reference"`, `"function"`, `"agent"`
- `code`
- `message`
- `identifier`

See additional documentation about Copilot errors at https://github.com/github/copilot-partners/blob/main/docs/copilot-errors.md.

#### `createDoneEvent()`

The `done` event should only be sent once, at the end of the response. No further events can be sent after the `done` event.

```js
import { createDoneEvent } from "@copilot-extensions/preview-sdk";

response.write(createDoneEvent().toString());
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

const { isValidRequest, payload } = await verifyAndParseRequest(
  request,
  signature,
  key
);

if (!isValidRequest) {
  throw new Error("Request could not be verified");
}

// `payload` has type support.
```

#### `getUserMessage()`

Convencience method to get the user's message from the request payload.

```js
import { getUserMessage } from "@copilot-extensions/preview-sdk";

const userMessage = getUserMessage(payload);
```

#### `getUserConfirmation()`

Convencience method to get the user's confirmation from the request payload (in case the user's last response was a confirmation).

```js
import { getUserConfirmation } from "@copilot-extensions/preview-sdk";

const userConfirmation = getUserConfirmation(payload);

if (userConfirmation) {
  console.log("Received a user confirmation", userConfirmation);
} else {
  // The user's last response was not a confirmation
}
```

## Dreamcode

While implementing the lower-level functionality, we also dream big: what would our dream SDK for Coplitot extensions look like? Please have a look and share your thoughts and ideas:

[dreamcode.md](./dreamcode.md)

## Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## License

[MIT](LICENSE)
