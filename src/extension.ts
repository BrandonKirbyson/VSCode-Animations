import * as vscode from "vscode";
import loadAnimations from "./animations";
import { addToConfig, removeFromConfig } from "./config";
import { getUpdatedCSS } from "./css";

export function activate(context: vscode.ExtensionContext) {
  const jsonPath = context.extensionPath + "/animations.json";
  const rootCSSPath = "file://" + context.extensionPath + "/style.css";

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.openAnimationSettings",
      () => {
        vscode.window.showTextDocument(vscode.Uri.file(jsonPath));
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.disableAnimations",
      () => {
        vscode.window.showInformationMessage("Disabled Animations");
        removeFromConfig(rootCSSPath).then(() => {
          vscode.commands.executeCommand("extension.updateCustomCSS");
        });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.enableAnimations",
      () => {
        vscode.window.showInformationMessage("Enabled Animations");
        addToConfig(rootCSSPath).then(() => {
          vscode.commands.executeCommand("extension.installCustomCSS");
        });
      }
    )
  );

  vscode.workspace.fs.readFile(vscode.Uri.file(jsonPath)).then((data) => {
    loadAnimations(JSON.parse(data.toString()));
  });

  const cssDirectory = context.extensionPath + "/dist/css/";

  getUpdatedCSS(
    [
      "Default-Transitions.css",
      "UI-Animations/Command-Palette/Scale.css",
      "UI-Animations/Primary-Sidebar/Slide.css",
    ],
    cssDirectory
  ).then((css) => {
    vscode.workspace.fs.writeFile(
      vscode.Uri.file(context.extensionPath + "/style.css"),
      Buffer.from(css)
    );
  });
}
