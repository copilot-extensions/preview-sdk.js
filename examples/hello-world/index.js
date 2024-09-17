import { createServer } from "node:http";

import {
  createTextEvent,
  createDoneEvent,
} from "@copilot-extensions/preview-sdk";

const server = createServer((request, response) => {
  console.log(`Received [${request.method}] to [${request.url}]`);

  if (request.method === "GET") {
    return response.end("ok");
  }

  response.write(createTextEvent("Hello, Francis Fuzz!"));
  response.end(createDoneEvent());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
