# Contributing

Thank you for considering to contribute to `github-project` 💖

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md).
By participating you agree to abide by its terms.

## Ways to contribute

- **Reporting bugs** - if you find a bug, please [report it](https://github.com/copilot-extensions/preview-sdk.js/issues/new)!
- **Suggesting features** - if you have an idea for a new feature, please [suggest it](https://github.com/copilot-extensions/preview-sdk.js/issues/new)!
- **Contribute dreamcode** - like dreaming big? Same! Send a pull request with your beautiful API design that is so good, we just _have_ to make it real: [dreamcode.md](https://github.com/copilot-extensions/preview-sdk.js/blob/main/dreamcode.md)!
- **Contribute code** - Yes! Please! We might even have [issues that are ready to be worked on](https://github.com/copilot-extensions/preview-sdk.js/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22pull%20request%20welcome%22)!

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x)

  We currently depend on Node 22+ for local development as we use new test APIs such as [snapshot testing](https://nodejs.org/api/test.html#snapshot-testing)! At some point we might move to a different test runner, but this works great to move fast in early aplha days.

### Setup

Use a codespace and you are all set: https://github.com/copilot-extensions/preview-sdk.js/codespaces.

Or, if you prefer to develop locally:

```
gh repo clone copilot-extensions/preview-sdk.js
cd preview-sdk.js
npm install
```

### Running tests

```
npm test
```

As part of the tests, we test types for our public APIs (`npm run test:types`) and our code (`npm run test:tsc`). Run `npm run` to see all available scripts.
