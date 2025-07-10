import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
	const prExtension = vscode.extensions.getExtension('github.vscode-pull-request-github');

	if (!prExtension) {
		vscode.window.showErrorMessage('Extensão de Pull Request do GitHub não encontrada.');
		return;
	}

	await prExtension.activate();
	const api = prExtension.exports.getAPI(1);

	console.log('API de PR do GitHub carregada:', api);

	const disposable = vscode.commands.registerCommand('inview.showPRPanel', async () => {
		const repos = api.repositories;
		if (!repos.length) {
			vscode.window.showWarningMessage('Nenhum repositório com PRs foi encontrado.');
			return;
		}

		const prs = await repos[0].getAllPullRequests();
		if (!prs.length) {
			vscode.window.showInformationMessage('Nenhum Pull Request disponível.');
			return;
		}

		const pr = prs[0];

		const panel = vscode.window.createWebviewPanel(
			'inviewPR',
			`PR: ${pr.title}`,
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent(pr);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(pr: any): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>InView - PR Viewer</title>
			<style>
				body {
					font-family: sans-serif;
					padding: 20px;
				}
				h1 {
					color: #007acc;
				}
				button {
					padding: 8px 16px;
					background-color: #007acc;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
				}
			</style>
		</head>
		<body>
			<h1>${pr.title}</h1>
			<p><strong>Autor:</strong> ${pr.author?.login}</p>
			<p><strong>URL:</strong> <a href="${pr.url}" target="_blank">${pr.url}</a></p>
			<button onclick="alert('Botão personalizado clicado!')">Analisar Dependências</button>
		</body>
		</html>
	`;
}
