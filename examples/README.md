This folder contains examples to show how you can use the Copilot Agent SDK in your own projects.
Keep in mind that the SDK is in preview, so things might be changed already!

If you find any issues or have any questions, please let us know by opening an issue, pull requests welcome (please read the (contribution guidelines)[../CONTRIBUTING.md] first).

# Examples
Here's an overview of the examples in this folder:
- 1-hello-world: A simple example that responds to all prompts with a message: "Hello, world!"
- 2-handle-prompt: An example that responds to prompts with a message: "Hello, world!" and then forwards the prompt to the Copilot API. The response from the Copilot API is then sent back to the user.

## Running the examples
These examples are setup so that you can run them inside a GitHub Codespace. To do so, follow these steps:
1. Open the GitHub Codespace by clicking the "Code" button in the top right of the repository and selecting "Open with Codespaces".
2. Once the Codespace is open, you can run the examples by running the following command in the terminal:
```sh
# go to the correct folder
cd examples/<example-name>
# install dependencies
npm install
# run the example
npm run start
```

> [!IMPORTANT: Make your port public]  
> By default, the examples will run on port 3000 and ports in Codespaces are private by default. If you want to access the examples from your browser, you'll need to make the port public. To do so, click on the "Ports" tab in the Codespace and right click, Go to "Port Visibility" next to port 3000 and set it to `public`. Do be aware that this will make the port accessible to anyone with the link to your Codespace. The port visibility setting is not saved when the Codespace is stopped, so you'll need to set it again if you restart the Codespace. The url does stay the same as long as the Codespace is not deleted.

> [!TIP: Make your port public]  
> Don't forget to set the Codespace url (with the port) in your GitHub App that you are using. The Copilot backend needs to be able to reach your Codespace to send messages to your extension. If your app is not running, the port is not public, or the codespace is stopped, the extension will not work.