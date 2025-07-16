import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {

	vscode.commands.registerCommand('inview.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World!');
	})
  
  context.subscriptions.push(
  vscode.commands.registerCommand('inview.showWebview', async () => {
    const panel = vscode.window.createWebviewPanel(
      'inviewPanel',
      'InView - Hello World',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    const html = getHelloWorldHtml();
    panel.webview.html = html;
  })
);
}

function getHelloWorldHtml(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Hello InView</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 2rem;
          background-color: #f0f0f0;
        }
        h1 {
          color: #007acc;
        }
      </style>
    </head>
    <body>
      <h1>Hello, InView!</h1>
      <p>Se você está vendo isso, sua webview está funcionando! 🎉</p>
    </body>
    </html>
  `;
}

export function deactivate() {}