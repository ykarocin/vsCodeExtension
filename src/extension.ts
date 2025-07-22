import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('inview.showWebview', () => {
    const panel = vscode.window.createWebviewPanel(
      'inviewWebview',
      'InView',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist', 'js')],
      }
    );

    const webview = panel.webview;
    const distJsPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'js');

    // Arquivos CSS
    const cssDependency = webview.asWebviewUri(vscode.Uri.joinPath(distJsPath, 'dependency-plugin.css'));
    const cssDiff = webview.asWebviewUri(vscode.Uri.joinPath(distJsPath, 'diff2html.css'));
    const cssTailwind = webview.asWebviewUri(vscode.Uri.joinPath(distJsPath, 'tailwind.css'));

    // Arquivo JS
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distJsPath, 'index.js'));

    // Monta o HTML da webview
    panel.webview.html = getWebviewContent(cssDependency, cssDiff, cssTailwind, scriptUri);
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(
  cssDependency: vscode.Uri,
  cssDiff: vscode.Uri,
  cssTailwind: vscode.Uri,
  scriptUri: vscode.Uri
): string {
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>InView</title>
      <link href="${cssDependency}" rel="stylesheet" />
      <link href="${cssDiff}" rel="stylesheet" />
      <link href="${cssTailwind}" rel="stylesheet" />
    </head>
    <body>
      <div id="root"></div>
      <script src="${scriptUri}"></script>
    </body>
    </html>
  `;
}