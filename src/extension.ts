import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { PlayPrompt } from './secret-alert-remediator';

const CAT_NAMES_COMMAND_ID = 'cat.namesInEditor';
const CAT_PARTICIPANT_ID = 'chat-sample.dadstaxi';

interface ICatChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  }
}

// Use gpt-4o since it is fast and high quality. gpt-3.5-turbo and gpt-4 are also available.
const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-4o' };

export function activate(context: vscode.ExtensionContext) {

  // Define a Cat chat handler. 
  const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<ICatChatResult> => {
    // To talk to an LLM in your subcommand handler implementation, your
    // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
    // The GitHub Copilot Chat extension implements this provider.
    
    if (request.command === 'help') {
      //return a help message
      stream.markdown(vscode.l10n.t('Welcome to the dads taxi chat assistant! 🚕🚕🚕'));
      stream.markdown(vscode.l10n.t('You can book a taxi with `@dadstaxi /book` or check for your current bookings `@dadstaxi /bookings`'));
    }
    else if (request.command === 'book') {
      //return a message
      stream.markdown(vscode.l10n.t('**Booked taxi: ' + request.prompt + '** \n\n'));
      stream.markdown(vscode.l10n.t('Thank you for booking a taxi with dads taxi! 🚕🚕🚕'));
    }
    else if (request.command === 'bookings') {
      //return a message
      stream.markdown(vscode.l10n.t('You have way too many bookings. Let poor dad rest! \n'));
      stream.markdown(vscode.l10n.t('Thank you for booking a taxi with dads taxi! 🚕🚕🚕'));
    }
    else if (request.command === 'examplebooking') {
      stream.progress('@dadstaxi `/book` pickup Dog from Vet at 3PM Saturday ');
      stream.markdown(vscode.l10n.t('Booked taxi: pickup Dog from Vet at 3PM Saturday \n\n'));
      stream.markdown(vscode.l10n.t('Thank you for booking a taxi with dads taxi! 🚕🚕🚕'));

      logger.logUsage('request', { kind: 'examplebooking' });
      return { metadata: { command: 'examplebooking' } };

    }
    else if (request.command === 'randomTeach') {
      stream.progress('Picking the right topic to teach...');
      const topic = getTopic(context.history);
      try {
        // To get a list of all available models, do not pass any selector to the selectChatModels.
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        if (model) {
          const messages = [
            vscode.LanguageModelChatMessage.User('You are a cat! Your job is to explain computer science concepts in the funny manner of a cat. Always start your response by stating what concept you are explaining. Always include code samples.'),
            vscode.LanguageModelChatMessage.User(topic)
          ];

          const chatResponse = await model.sendRequest(messages, {}, token);
          for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
          }
        }
      } catch (err) {
        handleError(logger, err, stream);
      }

      stream.button({
        command: CAT_NAMES_COMMAND_ID,
        title: vscode.l10n.t('Use Cat Names in Editor')
      });

      logger.logUsage('request', { kind: 'randomTeach' });
      return { metadata: { command: 'randomTeach' } };
    } else if (request.command === 'dadjoke') {
      stream.progress('Formulating a random dad joke...');
      try {
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        if (model) {
          // Here's an example of how to use the prompt-tsx library to build a prompt
          const { messages: promptMessages } = await renderPrompt(
            PlayPrompt,
            { userQuery: request.prompt },
            { modelMaxPromptTokens: model.maxInputTokens },
            model
          );

          // Map promptMessages to match vscode.LanguageModelChatMessage[]
          const messages: vscode.LanguageModelChatMessage[] = promptMessages.map(msg => ({
            role: msg.role,
            content: [{ type: 'text', value: msg.content }],
            name: msg.name
          }));

          const chatResponse = await model.sendRequest(messages, {}, token);
          for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
          }
        }
      } catch (err) {
        handleError(logger, err, stream);
      }

      logger.logUsage('request', { kind: 'dadjoke' });
      return { metadata: { command: 'dadjoke' } };
    } else if (request.command === 'clpy') {
    try {      
      // Ensure imageUrl is a valid URL pointing to an actual image
      const imageUrl = 'https://bear-images.sfo2.cdn.digitaloceanspaces.com/cloudystuey/scr-20240919-of6.png'; 
      
      // Stream the image
      //const responseWithImage = `![image](${imageUrl})`;
      const responseWithImage = `<img src="${imageUrl} />`;
      stream.markdown(responseWithImage);

// add html to the chat
const html = ``;
// stream.html(html); // 


    } catch (err) {
      handleError(logger, err, stream);
    }
  
    logger.logUsage('request', { kind: '' });
    return { metadata: { command: '' } };
  } else {
      try {
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        if (model) {
          const messages = [
            vscode.LanguageModelChatMessage.User(`You are a Dads taxi company! you are a taxi despatcher. answer succinctly. If the user asks for a taxi, respond with a dad joke and prefix with Let me tell you a joke:. Otherwise, respond with a taxi number.`),
            vscode.LanguageModelChatMessage.User(request.prompt)
          ];

          const chatResponse = await model.sendRequest(messages, {}, token);
          for await (const fragment of chatResponse.text) {
            // Process the output from the language model
            stream.markdown(fragment);
          }
        }
      } catch (err) {
        handleError(logger, err, stream);
      }

      logger.logUsage('request', { kind: '' });
      return { metadata: { command: '' } };
    }

    logger.logUsage('request', { kind: '' });
    return { metadata: { command: '' } };
  };

  // Chat participants appear as top-level options in the chat input
  // when you type `@`, and can contribute sub-commands in the chat input
  // that appear when you type `/`.
  const cat = vscode.chat.createChatParticipant(CAT_PARTICIPANT_ID, handler);
  cat.iconPath = vscode.Uri.joinPath(context.extensionUri, 'taxi-image.jpg');
  cat.followupProvider = {
    provideFollowups(result: ICatChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
      return [{
        prompt: 'create a sample booking',
        label: vscode.l10n.t('Create a booking'),
        command: 'examplebooking'
      } satisfies vscode.ChatFollowup];
    }
  };

  const logger = vscode.env.createTelemetryLogger({
    sendEventData(eventName, data) {
      // Capture event telemetry
      console.log(`Event: ${eventName}`);
      console.log(`Data: ${JSON.stringify(data)}`);
    },
    sendErrorData(error, data) {
      // Capture error telemetry
      console.error(`Error: ${error}`);
      console.error(`Data: ${JSON.stringify(data)}`);
    }
  });

  context.subscriptions.push(cat.onDidReceiveFeedback((feedback: vscode.ChatResultFeedback) => {
    // Log chat result feedback to be able to compute the success matric of the participant
    // unhelpful / totalRequests is a good success metric
    logger.logUsage('chatResultFeedback', {
      kind: feedback.kind
    });
  }));

  context.subscriptions.push(
    cat,
    // Register the command handler for the /meow followup
    vscode.commands.registerTextEditorCommand(CAT_NAMES_COMMAND_ID, async (textEditor: vscode.TextEditor) => {
      // Replace all variables in active editor with cat names and words
      const text = textEditor.document.getText();

      let chatResponse: vscode.LanguageModelChatResponse | undefined;
      try {
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        if (!model) {
          console.log('Model not found. Please make sure the GitHub Copilot Chat extension is installed and enabled.');
          return;
        }

        const messages = [
          vscode.LanguageModelChatMessage.User(`You are a cat! Think carefully and step by step like a cat would.
                    Your job is to replace all variable names in the following code with funny cat variable names. Be creative. IMPORTANT respond just with code. Do not use markdown!`),
          vscode.LanguageModelChatMessage.User(text)
        ];
        chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

      } catch (err) {
        if (err instanceof vscode.LanguageModelError) {
          console.log(err.message, err.code, err.cause);
        } else {
          throw err;
        }
        return;
      }

      // Clear the editor content before inserting new content
      await textEditor.edit(edit => {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(textEditor.document.lineCount - 1, textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length);
        edit.delete(new vscode.Range(start, end));
      });

      // Stream the code into the editor as it is coming in from the Language Model
      try {
        for await (const fragment of chatResponse.text) {
          await textEditor.edit(edit => {
            const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
            const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
            edit.insert(position, fragment);
          });
        }
      } catch (err) {
        // async response stream may fail, e.g network interruption or server side error
        await textEditor.edit(edit => {
          const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
          const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
          edit.insert(position, (<Error>err).message);
        });
      }
    }),
  );

  return;
}

function handleError(logger: vscode.TelemetryLogger, err: any, stream: vscode.ChatResponseStream): void {
  // making the chat request might fail because
  // - model does not exist
  // - user consent not given
  // - quote limits exceeded
  logger.logError(err);

  if (err instanceof vscode.LanguageModelError) {
    console.log(err.message, err.code, err.cause);
    if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
      stream.markdown(vscode.l10n.t('I\'m sorry, I can only explain computer science concepts.'));
    }
  } else {
    // re-throw other errors so they show up in the UI
    throw err;
  }
}

// Get a random topic that the cat has not taught in the chat history yet
function getTopic(history: ReadonlyArray<vscode.ChatRequestTurn | vscode.ChatResponseTurn>): string {
  const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
  // Filter the chat history to get only the responses from the cat
  const previousCatResponses = history.filter(h => {
    return h instanceof vscode.ChatResponseTurn && h.participant === CAT_PARTICIPANT_ID;
  }) as vscode.ChatResponseTurn[];
  // Filter the topics to get only the topics that have not been taught by the cat yet
  const topicsNoRepetition = topics.filter(topic => {
    return !previousCatResponses.some(catResponse => {
      return catResponse.response.some(r => {
        return r instanceof vscode.ChatResponseMarkdownPart && r.value.value.includes(topic);
      });
    });
  });

  return topicsNoRepetition[Math.floor(Math.random() * topicsNoRepetition.length)] || 'I have taught you everything I know. Meow!';
}

export function deactivate() { }
