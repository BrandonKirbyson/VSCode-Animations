import * as vscode from "vscode";
import loadAnimations from "./animations";
import { addToConfig, removeFromConfig } from "./config";
import { getUpdatedCSS } from "./css";

export function activate(context: vscode.ExtensionContext) {
  const jsonPath = context.extensionPath + "/animations.json";
  const rootCSSPath = "file://" + context.extensionPath + "/style.css"; //The path to the root css file which should be used for Custom CSS extension

  /**
   * Register the command to open the settings file
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.openAnimationSettings",
      () => {
        vscode.window.showTextDocument(vscode.Uri.file(jsonPath));
      }
    )
  );

  /**
   * Register the command to disable the root css file in the Custom CSS extension
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.disableAnimations",
      () => {
        vscode.window.showInformationMessage("Disabled Animations");
        //Remove the root css file from the Custom CSS extension
        removeFromConfig(rootCSSPath).then(() => {
          vscode.commands.executeCommand("extension.updateCustomCSS"); //Reload the Custom CSS extension
        });
      }
    )
  );

  /**
   * Register the command to enable the root css file in the Custom CSS extension and reload the Custom CSS extension
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.enableAnimations",
      () => {
        vscode.window.showInformationMessage("Enabled Animations");
        //Add the root css file to the Custom CSS extension
        addToConfig(rootCSSPath).then(() => {
          vscode.commands.executeCommand("extension.installCustomCSS"); //Reload the Custom CSS extension
        });
      }
    )
  );

  /**
   * Loads the animations from the animations.json file
   */
  vscode.workspace.fs.readFile(vscode.Uri.file(jsonPath)).then((data) => {
    loadAnimations(JSON.parse(data.toString()));
  });

  const cssDirectory = context.extensionPath + "/dist/css/"; //The path to the css directory

  /**
   * Get the updated css and write it to the root css file
   */
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
