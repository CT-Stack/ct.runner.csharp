'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

import {WatchAndTestCommand} from "./commands/WatchAndTestCommand";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ct-runner-csharp" is now active!');

    var disposable = vscode.commands.registerCommand('ct.runTestObserver', () => {
        var currentWorkingDir = vscode.workspace.rootPath;
        if (!fs.existsSync(currentWorkingDir)) {
            vscode.window.showErrorMessage("Root path doesn't exist");
            return;
        }
        var watchAndTestCmmand = new WatchAndTestCommand(currentWorkingDir, "test_results.xml");
        watchAndTestCmmand.execute();
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}