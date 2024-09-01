# Copilot Extension Dreamcode

Dream code is code that is not real. Its purpose is to create the most user-friendly SDK APIs from the perspectives of developers who want to build GitHub Extensions using JavaScript/Typescript.

Please, any questions/feedback/feelings are welcome. This is a safe space. Please file issues or jump right in and start pull requests.

## Features

- Event-based API for receiving and responding to messages
- Automated Payload verification
- High-level APIs for different types of responses (text, confirmation, references, etc.)
- High-level API for interacting with models

## API

```js
import { createServer } from "http";

import {
  CopilotExtension,
  createNodeMiddleware,
} from "@octokit/copilot-extension";

const copilotExtension = new CopilotExtension({
  userAgent: "my-app-name",
});

copilotExtension.on(
  "message",
  async ({ message, octokit, prompt, respond, log }) => {
    log.info("Received a message:", message.content);

    const { data: user } = await octokit.request("GET /user");
    await respond.text(`Hello, ${user.login}!`);

    await respond.confirmation({
      title: "Would you like to hear a joke?",
      message: "I have a joke about construction, but I'm still working on it.",
      id: "joke",
      // optional
      meta: {
        other: "data",
      },
    });
  }
);

// https://github.com/github/copilot-partners/blob/6d1cde3a1abb147da53f1a39864661dc824d40b5/docs/confirmations.md
copilotExtension.on(
  "confirmation",
  async ({ confirmation, octokit, prompt, respond, log }) => {
    if (confirmation.id === "joke") {
      if (confirmation.state === "dismissed") {
        await respond.text("Okay, maybe next time!");
        return;
      }

      await respond.text(
        prompt.stream("Please tell me a joke about Mona Lisa, Github's mascot.")
      );
      return;
    }

    log.warn("Received an unknown confirmation:", confirmation.id);
    await respond.text("Hmm, something went wrong. Please try again later.");
  }
);

createServer(createNodeMiddleware(copilotExtension)).listen(3000);
copilotExtension.log.info("Listening on http://localhost:3000");
```

For other environments, these methods are available:

```js
// verify the payload and call handlers
copilotExtension.verifyAndReceive({ payload, signature, keyId });
// same, but skip verification
copilotExtension.receive({ payload });

// and if you don't want to use the event-based API
const { isValidRequest, payload } = await copilotExtension.verifyAndParse(
  payload,
  signature,
  keyId
);
```

## Notes

Regarding the context passed to event handlers

- `message` / `confirmation` / etc are objects as received by the user
- `octokit` is a pre-authenticated octokit instance
- `prompt` is based on my work at https://github.com/github/gr2m-projects/blob/167/github-models/167-github-models/README.md. A simple API to interact with GitHub models. I assume we will default the prompt URL to `https://api.githubcopilot.com/chat/completions` and the model to `gpt-4o` (or whatever our CAPI name for that is?)
- The `prompt` API will automatically apply interop transformations if the request is sent to an endpoint other than Copilot's chat complitions endpoint.
- `respond` is an API to send different types of responses to the user
- `log` is the logger as we use it in Octokit. See https://github.com/octokit/core.js?tab=readme-ov-file#logging

On how to receive the events (transport layer)

- `createNodeMiddleware` is something we have currently built into some of the Octokit SDKs, e.g. https://github.com/octokit/app.js?tab=readme-ov-file#createnodemiddlewareapp-options. However, I think we will move these out into separate packages, such as `@octokit/webhooks-middleware-node`, etc. But for now, we can just assume that we ship with it by default. We can also add other middlewares for Netlify/Vercel edge functions, lambda, etc.
