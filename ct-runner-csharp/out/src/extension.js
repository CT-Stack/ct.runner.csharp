'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const WatchAndTestCommand_1 = require("./commands/WatchAndTestCommand");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ct-runner-csharp" is now active!');
    var disposable = vscode.commands.registerCommand('ct.runTestObserver', () => {
        var currentWorkingDir = vscode.workspace.rootPath;
        if (!fs.existsSync(currentWorkingDir)) {
            vscode.window.showErrorMessage("Folder must be open before start.");
            return;
        }
        var watchAndTestCmmand = new WatchAndTestCommand_1.WatchAndTestCommand(currentWorkingDir, "test_results.xml");
        watchAndTestCmmand.execute();
    });
    context.subscriptions.push(disposable);
    vscode.window.showInformationMessage("CTRunner is running.");
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map