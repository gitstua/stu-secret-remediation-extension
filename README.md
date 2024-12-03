# Dadstaxi Copilot Chat Example

Visual Studio Code's Copilot Chat architecture enables extension authors to integrate with the GitHub Copilot Chat experience. A chat extension is a VS Code extension that uses the Chat extension API by contributing a Chat participant. Chat participants are domain experts that can answer user queries within a specific domain.

The Language Model API enables you to use the Language Model and integrate AI-powered features and natural language processing in your Visual Studio Code extension.

When an extension uses the Chat or the Language Model API, we call it a GitHub Copilot Extension, since GitHub Copilot is the provider of the Chat and the Language Model experience.

This GitHub Copilot Extension sample shows:

- How to contribute a chat participant to the GitHub Copilot Chat view.
- How to return static responses to user queries.
- How to use the Language Model API to request access to the Language Model (gpt-4o, gpt-3.5-turbo, gpt-4).

![demo](./demo.png)

Related documentation for the demo this is based on can be found here:
- https://code.visualstudio.com/api/extension-guides/chat
- https://code.visualstudio.com/api/extension-guides/language-model

## Installation
TODO: publish to VSCode marketplace

## Example usage
TODO

# Developers
If you install this from the marketplace you can ignore this section. This is the inner loop for how you would develop an extension like this...

## Running the Sample Locally as a developer

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
	- You will see the @dadstaxi chat participant show in the GitHub Copilot Chat view

![alt text](image.png)

# Privacy
This extension does not store the bookings - these are static and only exist in memory to generate a response. The language model is not called for any real data, only for generating samples.

If you want to build your own privacy focused extension, you should consider the following:
- [github.com/Copilot-Extensions](https://github.com/Copilot-Extensions) - to build extensions that work with Copilot supported IDE and in web browsers
- [Copilot Trust Center](https://copilot.github.trust.page/) - to learn more about how GitHub Copilot keeps your code secure and private
