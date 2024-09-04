# Copilot Extension Dreamcode

Dream code is code that is not real. Its purpose is to create the most user-friendly SDK APIs from the perspectives of developers who want to build GitHub Extensions using JavaScript/Typescript.

Please, any questions/feedback/feelings are welcome. This is a safe space. Please file issues or jump right in and start pull requests.

## Features

- Event-based API for receiving and responding to messages
- Automated Payload verification
- High-level APIs for different types of responses (text, confirmation, references, etc.)
- High-level API for interacting with models
- High-level API for function calls
- High-level API for requesting user confirmation before a function is called

## Examples

### Tell a joke

```js
import { createServer } from "http";

import { CopilotAgent, createNodeMiddleware } from "@octokit/copilot-extension";

const agent = new CopilotAgent({
  userAgent: "my-app-name",
});

agent.on("message", async ({ message, octokit, prompt, respond, log }) => {
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
});

// https://github.com/github/copilot-partners/blob/6d1cde3a1abb147da53f1a39864661dc824d40b5/docs/confirmations.md
agent.on(
  "confirmation",
  async ({ confirmation, octokit, prompt, respond, log }) => {
    if (confirmation.id === "joke") {
      if (confirmation.state === "dismissed") {
        await respond.text("Okay, maybe next time!");
        return;
      }

      await respond.text(
        prompt.stream(
          "Please tell me a joke about Mona Lisa, Github's mascot.",
        ),
      );
      return;
    }

    log.warn("Received an unknown confirmation:", confirmation.id);
    await respond.text("Hmm, something went wrong. Please try again later.");
  },
);

createServer(createNodeMiddleware(agent)).listen(3000);
agent.log.info("Listening on http://localhost:3000");
```

### Book a flight

I'm using [@daveebbelaar](https://github.com/daveebbelaar)'s example of a flight booking agent that they demonstrate at https://www.youtube.com/watch?v=aqdWSYWC_LI

```js
import { createServer } from "http";

import { CopilotAgent, createNodeMiddleware } from "@octokit/copilot-extension";

const copilotAgent = new CopilotAgent({
  userAgent: "book-a-flight",

  // TBD: are we supporting a default model? Globally, or for an enterprise/organization/user?
  model: {
    // Defaults to "gpt-4". Get available models from https://api.githubcopilot.com/models
    name: "gpt-4",
    // Defaults to "https://api.githubcopilot.com/chat/completions"
    endpoint: "https://api.githubcopilot.com/chat/completions",
    // when enabled, messages are passed through to Copilot's chat completions API
    // defaults to false. Set to true when `functions` is set
    passThrough: true,
  },

  functions: [
    {
      name: "lookup_flight",
      description: "Look up a flight based on time, origin, and destination",
      parameters: {
        time: {
          type: "string",
          description:
            "The time when the flight should depart as ISO 8601 date time string",
        },
        origin: {
          type: "string",
          description: "The airport short code for the origin of the flight",
        },
        destination: {
          type: "string",
          description:
            "The airport short code for the destination of the flight",
        },
      },
      async run({ time, origin, destination }) {
        const result = await myFlightLookupFunction(time, origin, destination);
        return {
          departureTime: result.departureTime,
          timezoneDifference: result.timezoneDifference,
          arrivalTime: result.arrivalTime,
          travelTime: result.travelTime,
          flightNumber: result.flightNumber,
          airline: result.airline,
          originCity: result.originCity,
          originCode: result.originCode,
          destinationCity: result.destinationCity,
          destinationCode: result.destinationCode,
          travelTime: result.travelTime,
        };
      },
    },
    {
      name: "book_flight",
      description: "Book a flight based flight number and day",
      parameters: {
        flightNumber: {
          type: "string",
          description: "The flight number",
        },
        date: {
          type: "string",
          description: "The date of the flight as an ISO 8601 date string",
        },
      },
      // setting a confirmation key will prompt the user to confirm an action before it is taken
      confirmation: {
        title: "Confirm you want me to book the following flight",
        message(parameters) {
          return `Yes, please book flight ${parameters.flightNumber} on ${parameters.date}`;
        },
      },
      async run({ flightNumber, date }) {
        const result = await myFlightBookingFunction(flightNumber, date);
        return {
          flightNumber,
          departureTime: result.date,
          confirmationNumber: result.confirmationNumber,
          seat: result.seat,
        };
      },
    },
  ],
});

// you can still hook into messages and function calls before they are passed through
// to the chat completions API.
copilotAgent.on("message", async ({ log }) => {
  log.info("Received a message:", message.content);

  // if you don't want a request to be forwarded to the chat completions API, call `await respond.done()` explicitly
});
copilotAgent.on("function_call", async ({ log, name, parameters }) => {
  log.info(
    "Received a function call for %s with parameters %o",
    name,
    parameters,
  );
});

createServer(createNodeMiddleware(copilotAgent)).listen(3000);
copilotAgent.log.info("Listening on http://localhost:3000");
```

For other environments, these methods are available:

```js
// verify the payload and call handlers
await copilotAgent.verifyAndReceive({ payload, signature, keyId });
// same, but skip verification
await copilotAgent.receive({ payload });

// and if you don't want to use the event-based API
const { isValidRequest, payload } = await copilotAgent.verifyAndParse(
  payload,
  signature,
  keyId,
);
```

## Notes

Regarding the context passed to event handlers

- `message` / `confirmation` / etc are objects as received by the user
- `octokit` is a pre-authenticated octokit instance
- `prompt` is based on my work at https://github.com/github/gr2m-projects/blob/167/github-models/167-github-models/README.md. A simple API to interact with GitHub models. I assume we will default the prompt URL to `https://api.githubcopilot.com/chat/completions` and the model to `gpt-4o` (or whatever our CAPI name for that is?)
- The `prompt` API
  - will automatically apply interop transformations if the request is sent to an endpoint other than Copilot's chat complitions endpoint.
  - will automatically pass through past messages unless explicitly overridden
- `respond` is an API to send different types of responses to the user
- `log` is the logger as we use it in Octokit. See https://github.com/octokit/core.js?tab=readme-ov-file#logging

On how to receive the events (transport layer)

- `createNodeMiddleware` is something we have currently built into some of the Octokit SDKs, e.g. https://github.com/octokit/app.js?tab=readme-ov-file#createnodemiddlewareapp-options. However, I think we will move these out into separate packages, such as `@octokit/webhooks-middleware-node`, etc. But for now, we can just assume that we ship with it by default. We can also add other middlewares for Netlify/Vercel edge functions, lambda, etc.
