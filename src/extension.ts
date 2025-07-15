import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('inview.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World!');
	})
  const prExtension = vscode.extensions.getExtension('GitHub.vscode-pull-request-github');

  if (!prExtension) {
    vscode.window.showErrorMessage('Extensão de Pull Request do GitHub não encontrada.');
    return;
  }

  await prExtension.activate();
  const api = prExtension.exports.getApi?.(1);

 if (!api) {
  vscode.window.showErrorMessage('Não foi possível acessar a API da extensão de PRs.');
  return;
}

  context.subscriptions.push(
    vscode.commands.registerCommand('inview.showWebview', async () => {
      const repo = api.repositories[0];
      const pr = repo?.state.activePullRequest;

      if (!pr) {
        vscode.window.showWarningMessage('Nenhum Pull Request ativo encontrado.');
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        'inviewPanel',
        `InView - PR #${pr.number}`,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const html = getInViewHtml(pr.number, pr.title);
      panel.webview.html = html;
    })
  );
}

function getInViewHtml(prNumber: number, prTitle: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>InView PR</title>
      <style>
        body { font-family: sans-serif; padding: 1rem; }
        h1 { color: #3f51b5; }
      </style>
    </head>
    <body>
      <h1>InView: Revisão do PR #${prNumber}</h1>
      <p><strong>Título:</strong> ${prTitle}</p>
      <p>Aqui você poderá carregar visualizações como o Diff de Três Vias e o Grafo de Dependências.</p>
      <!-- Você pode incluir aqui seu HTML reutilizado da extensão de navegador -->
    </body>
    </html>
  `;
}

export function deactivate() {}
