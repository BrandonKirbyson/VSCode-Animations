import * as vscode from "vscode";
import loadAnimations from "./animations";

export function activate(context: vscode.ExtensionContext) {
  const jsonPath = context.extensionPath + "/animations.json";

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.openAnimationSettings",
      () => {
        vscode.window.showTextDocument(vscode.Uri.file(jsonPath));
      }
    )
  );

  vscode.workspace.fs.readFile(vscode.Uri.file(jsonPath)).then((data) => {
    loadAnimations(JSON.parse(data.toString()));
  });
}
