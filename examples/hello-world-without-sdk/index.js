import { createServer } from "node:http";

const server = createServer((request, response) => {
  if (request.method === "GET") {
    return response.end("ok");
  }

  const textObject = {
    choices: [
      { index: 0, delta: { content: "Hello, world!", role: "assistant" } },
    ],
  };

  const endObject = {
    choices: [{ index: 0, finish_reason: "stop", delta: { content: null } }],
  };

  // note the "\n\n"s, they are significant.
  response.write(`data: ${JSON.stringify(textObject)}\n\n`);
  response.end(`data: ${JSON.stringify(endObject)}\n\ndata: [DONE]\n\n`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
