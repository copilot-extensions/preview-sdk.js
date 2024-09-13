import { createServer } from "http";

import {
  createTextEvent,
  createDoneEvent,
} from "@copilot-extensions/preview-sdk";

const server = createServer((request, ressponse) => {
  console.log(`Received [${request.method}]`);
  if (request.method === "GET") {
    return ressponse.end("ok");
  }

  ressponse.write(createTextEvent("Hello, world!"));
  ressponse.end(createDoneEvent());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});