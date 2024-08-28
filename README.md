# `@copilot-extensions/preview-sdk`

> SDK for building GitHub Copilot Extensions

⚠️ **This SDK is a preview and subject to change**. We will however adhere to [semantic versioning](https://semver.org/), so it's save to use for early experimentation. Just beware there will be breaking changes. Best to watch this repository's releases for updates.

## Usage

### `verify(rawBody, signature, keyId, options)`

```js
import { verify } from "@copilot-extensions/preview-sdk";

const payloadIsVerified = await verify(request.body, signature, keyId, {
  token,
});
// true or false
```

## Dreamcode

While implementing the lower-level functionality, we also dream big: what would our dream SDK for Coplitot extensions look like? Please have a look and share your thoughts and ideas:

[dreamcode.md](./dreamcode.md)

## Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## License

[MIT](LICENSE)
