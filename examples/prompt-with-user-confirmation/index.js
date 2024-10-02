import { createServer } from "node:http";
import { Octokit } from "octokit";
import {
  createAckEvent,
  createDoneEvent,
  prompt,
  verifyAndParseRequest,
  createConfirmationEvent,
  getUserConfirmation,
  createTextEvent,
} from "@copilot-extensions/preview-sdk";

// Define the port to listen on
const PORT = 3000;

// Define the handler function
async function handler(request, response) {
  console.log(`Received [${request.method}] to [${request.url}]`);

  if (request.method !== "POST") {
    // Handle other request methods if necessary
    response.writeHead(405, { "Content-Type": "text/plain" });
    console.log(`Method ${request.method} not allowed`);

    response.end("Method Not Allowed");
    return;
  }

  // get a token to use
  const tokenForUser = request.headers["x-github-token"];

  // get the user information with the token
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");

  // Collect incoming data chunks to use in the `on("end")` event
  const body = await getBody(request);
  const signature = String(request.headers["github-public-key-signature"]);
  const keyID = String(request.headers["github-public-key-identifier"]);

  try {
    const { isValidRequest, payload } = await verifyAndParseRequest(
      body,
      signature,
      keyID,
      {
        token: tokenForUser,
      },
    );

    if (!isValidRequest) {
      console.error("Request verification failed");
      response.writeHead(401, { "Content-Type": "text/plain" });
      response.end("Request could not be verified");
      return;
    }

    // write the acknowledge event to let Copilot know we are handling the request
    // this will also show the message "Copilot is responding" in the chat
    response.write(createAckEvent());

    // check if we have user confirmation input in the payload
    // this will not be true the first time, only after the user has confirmed
    const userConfirmation = getUserConfirmation(payload);

    if (userConfirmation) {
      console.log("Received a user confirmation", userConfirmation);
      // handle the confirmation response here and close the conversation
      if (userConfirmation.accepted) {
        response.write(createTextEvent("Thank you for confirming you like oranges!"));
      } else {
        response.write(createTextEvent("Thank you for letting me know you don't like oranges!"));
      }
      // tell Copilot we are done handling the request
      response.end(createDoneEvent());
      console.log("Response sent");
      // break the code flow here with early exit
      return;
    } else {
      // The user's last response was not a confirmation, so we can continue the flow below
    }

    // pick up the user prompt and handle it
    const payload_message = payload.messages[payload.messages.length - 1];
    if (payload_message.content.includes("orange")) {
      console.log("The user said orange, so we trigger the confirmation event");

      response.write(
        createConfirmationEvent({
          id: "123",
          title: "Please confirm?",
          message: "So you like oranges?",
        }),
      );
    }
    else {
      console.log("Calling the GitHub Copilot API with the user prompt");
      // forward the prompt to the Copilot API is the last message in the payload
      const { stream } = await prompt.stream(payload_message.content, {
        system: `You are a helpful assistant that replies to user messages as if you were the Blackbeard Pirate. Start every response with the user's name, which is @${user.data.login}`, // extra instructions for the prompt
        messages: payload.messages, // we are giving the prompt the existing messages in this chat conversation for context
        token: tokenForUser,
      });

      // stream the prompt response back to Copilot
      for await (const chunk of stream) {
        response.write(new TextDecoder().decode(chunk));
      }
    }

    // write the done event to let Copilot know we are done handling the request
    response.end(createDoneEvent());
    console.log("Response sent");
  } catch (error) {
    console.error("Error:", error);
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Internal Server Error");
  }
}

// Create an HTTP server
const server = createServer(handler);

// Start the server
server.listen(PORT);
console.log(`Server started at http://localhost:${PORT}`);

/**
 *
 * @param {import("node:http").IncomingMessage} request
 * @returns
 */
function getBody(request) {
  return new Promise((resolve) => {
    const bodyParts = [];
    let body;
    request
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyParts).toString();
        resolve(body);
      });
  });
}