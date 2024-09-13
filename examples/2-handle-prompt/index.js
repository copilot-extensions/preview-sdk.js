import { createServer } from 'node:http';
import { Octokit } from "@octokit/rest";
import { 
    createAckEvent, 
    createDoneEvent, 
    createTextEvent, 
    parseRequestBody, 
    prompt
 } from "@copilot-extensions/preview-sdk";


// Define the handler function
const handler = async (request, response) => {
    if (request.method === 'POST') {
        console.log('Received POST request');

        // get a token to use
        const tokenForUser = request.headers['x-github-token'];
        
        // get the user information with the token        
        const octokit = new Octokit({ auth: tokenForUser });
        const user = await octokit.request("GET /user");
        const userHandle = user.data.login
        
        // Collect incoming data chunks to use in the `on("end")` event
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        // Parse the collected data once the request ends
        request.on('end', async () => {
            try {                
                // start sending the response back to Copilot
                console.log('Handling response');
                // header to indicate the state
                response.writeHead(200, { 'Content-Type': 'application/json' });
                // write the acknowledge event to let Copilot know we are handling the request
                // this will also show the message "Copilot is responding" in the chat
                response.write(createAckEvent());

                // parse the incoming body as that has the information we need to handle the request / user prompt
                const payload = parseRequestBody(body);
                
                // start writing text in the response
                const textEvent = createTextEvent(`Hello ${userHandle}, \n\n`);
                response.write(textEvent);
                // add new lines to mark the difference between the fixed text and the dynamic text
                response.write("\n\n");
                       
                // add a first system prompt for the payload.messages to add instructions
                payload.messages.unshift({ role: "system", content: "You are a helpful assistant that talks like a pirate." });	

                // get an authentication token to use
                const tokenForUser = request.headers['x-github-token'];

                console.log('Calling the GitHub Copilot API with the user prompt');
                // the prompt to forward to the Copilot API is the last message in the payload
                const payload_message = payload.messages[payload.messages.length - 1];
                const result = await prompt(payload_message.content, {
                    messages: payload.messages, // we are giving the prompt the existing messages in this chat conversation
                    model: "gpt-4",
                    token: tokenForUser         
                });

                // write the prompt response back to Copilot
                // note that this is only send when the entire response from the Copilot API is ready
                response.write(createTextEvent(result.message.content));

                // write the done event to let Copilot know we are done handling the request
                response.end(createDoneEvent());
                console.log('Response sent');
            }
            catch (error) {
                console.error('Error:', error);
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Internal Server Error');
            }
        });
    } else {
        // Handle other request methods if necessary
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        console.log(`Method ${request.method} not allowed`);
        
        response.end('Method Not Allowed');
    }
};

// Create an HTTP server
const server = http.createServer(handler);

// Define the port to listen on
const PORT = 3000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});