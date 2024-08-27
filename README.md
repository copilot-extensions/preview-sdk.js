# `@copilot-extensions/preview-sdk`

> SDK for building GitHub Copilot Extensions

⚠️ **This SDK is a preview and subjetct to change**. We will however adhere to [semantic versioning](https://semver.org/), so it's save to use for early experimentation. Just beware there will be breaking changes. Best to watch this repository's releases for updates.

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

const payloadIsVerified = await verify(request.body, signature, key);
// true or false
```

## Dreamcode

While implementing the lower-level functionality, we also dream big: what would our dream SDK for Coplitot extensions look like? Please have a look and share your thoughts and ideas:

[dreamcode.md](./dreamcode.md)

## Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## License

[MIT](LICENSE)
