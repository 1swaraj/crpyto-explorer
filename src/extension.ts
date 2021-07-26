import * as vscode from 'vscode';
import { CrpytoProvider } from './crypto';

export function activate(context: vscode.ExtensionContext) {

	const coinProvider =  new CrpytoProvider();
	vscode.window.registerTreeDataProvider('crpytoList', coinProvider);
	vscode.commands.registerCommand('crpytoList.refresh', () =>
    	coinProvider.refresh()
  	);
}

export function deactivate() {}