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

## API

### `async verifyRequestByKeyId(rawBody, signature, keyId, options)`

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

### `async fetchVerificationKeys(options)`

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

### `async verifyRequestPayload(rawBody, signature, keyId)`

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

## Dreamcode

While implementing the lower-level functionality, we also dream big: what would our dream SDK for Coplitot extensions look like? Please have a look and share your thoughts and ideas:

[dreamcode.md](./dreamcode.md)

## Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## License

[MIT](LICENSE)
