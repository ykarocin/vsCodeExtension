import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('inview.analyzePR', async () => {
    try {
      // Acessa o Git
      const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
      const api = gitExtension?.getAPI(1);
      const repo = api?.repositories[0];
      if (!repo) {
        vscode.window.showErrorMessage('No git repository open.');
        return;
      }

      const currentBranch = repo.state.HEAD?.name;
      if (!currentBranch) {
        vscode.window.showErrorMessage('Was not possible to determinate the current branch.');
        return;
      }

      // Descobre o remote
      const remoteUrl = repo.state.remotes[0]?.fetchUrl || '';
      const match = /github\.com[:/](.*?)(?:\.git)?$/.exec(remoteUrl);
      if (!match) {
        vscode.window.showErrorMessage('github remote repository not founded');
        return;
      }
      const repoFullName = match[1];

      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        vscode.window.showErrorMessage('github token not founded.');
        return;
      }

      const response = await fetch(`https://api.github.com/repos/${repoFullName}/pulls?state=open&per_page=100`, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });

      const openPRs = await response.json();

      if (!Array.isArray(openPRs)) {
        vscode.window.showErrorMessage('Error searching pull requests.');
        return;
      }

      const prOptions = openPRs.map(pr => ({
        label: `#${pr.number} - ${pr.title}`,
        description: pr.user.login,
        detail: pr.head.ref,
        pr
      }));

      const selected = await vscode.window.showQuickPick(prOptions, {
        placeHolder: 'Select a Pull Request'
      });

      if (!selected) {
        vscode.window.showInformationMessage('No PR selected.');
        return;
      }

      const pr = selected.pr;


      // Cria WebView
      const panel = vscode.window.createWebviewPanel(
        'prView',
        `InView: PR #${pr.number}`,
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>PR #${pr.number}</title>
        </head>
        <body>
          <h1>${pr.title}</h1>
          <p><strong>Author:</strong> ${pr.user.login}</p>
          <p><strong>Status:</strong> ${pr.state}</p>
          <p><strong>Base:</strong> ${pr.base.ref}</p>
          <p><strong>Description:</strong></p>
          <pre>${pr.body || 'lorem ipsum'}</pre>
          <a href="${pr.html_url}">See on GitHub</a>
        </body>
        </html>
      `;
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage('Error analyzyng PR: ' + (error as Error).message);
    }
  });

  context.subscriptions.push(disposable);
}
