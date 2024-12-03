import * as vscode from 'vscode';
import * as axios from 'axios';

const TOKEN_KEY = 'githubPatToken';

async function storeToken(context: vscode.ExtensionContext, token: string) {
    //@ts-ignore
    const secrets = context['secrets'];
    await secrets.store(TOKEN_KEY, token);
}

async function getToken(context: vscode.ExtensionContext) {
    //@ts-ignore
    const secrets = context['secrets'];
    return await secrets.get(TOKEN_KEY);
}

export function activate(context: vscode.ExtensionContext) {
    // Command to store GitHub PAT
    let setTokenCommand = vscode.commands.registerCommand('extension.setGitHubToken', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter GitHub Personal Access Token',
            password: true,
            validateInput: (value) => {
                return value && value.length >= 40 ? null : 'Token must be at least 40 characters';
            }
        });
        if (token) {
            await storeToken(context, token);
            vscode.window.showInformationMessage('GitHub token stored successfully');
        }
    });

    // Command to get secret scanning alerts
    let getAlertsCommand = vscode.commands.registerCommand('extension.getSecretScanningAlerts', async () => {
        const repoUrl = await vscode.window.showInputBox({ prompt: 'Enter GitHub repository URL' });
        if (!repoUrl) {
            vscode.window.showErrorMessage('Repository URL is required');
            return;
        }

        const token = await getToken(context);
        if (!token) {
            vscode.window.showErrorMessage('GitHub token not found. Please set it first using the Set GitHub Token command.');
            return;
        }

        try {
            const alerts = await getSecretScanningAlertsFromRepo(repoUrl, token);
            vscode.window.showInformationMessage(`Found ${alerts.length} secret scanning alerts`);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to get secret scanning alerts: ${error?.message || 'Unknown error'}`);
        }
    });

    context.subscriptions.push(setTokenCommand, getAlertsCommand);
}

async function getSecretScanningAlertsFromRepo(repoUrl: string, token: string) {
    try {
        const url = new URL(repoUrl);
        const [owner, repo] = url.pathname.split('/').filter(Boolean);
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/secret-scanning/alerts`;
        
        const response = await axios.default.get(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Invalid repository URL or API request failed');
    }
}

export function deactivate() {}