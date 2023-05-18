import * as vscode from "vscode";
import { addToConfig } from "./config";
import { emptyCSSFile, generateCSSFile } from "./css";

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  const rootCSSPath =
    "file://" + context.extensionPath + "/dist/updateHandler.js"; //The path to the root css file which should be used for Custom CSS extension

  //Add the root css file to the custom css imports
  addToConfig(rootCSSPath).then((added) => {
    //If the root css file was added to the config
    if (added) {
      vscode.window
        .showInformationMessage(
          "Installed VSCode-Animations, reload for animations to take effect",
          "Reload",
          "Cancel"
        )
        .then((value) => {
          //If the user clicked the reload button
          if (value === "Reload") {
            //Install the custom css extension
            vscode.commands
              .executeCommand("extension.installCustomCSS")
              .then(() => {
                vscode.commands.executeCommand("workbench.action.reloadWindow"); //Reload the window
              });
          }
        });
    }
  });

  /**
   * Checks if the Custom CSS and JS Loader extension is installed/enabled and prompts the user to install/enable it if it is not installed/enabled
   */
  if (!vscode.extensions.getExtension("be5invis.vscode-custom-css")) {
    vscode.window
      .showWarningMessage(
        "VSCode-Animations: The Custom CSS and JS Loader extension is not installed/enabled. Please install or enable it to use this extension.",
        "Install/Enable"
      )
      .then((value) => {
        if (value === "Install/Enable") {
          //Open the extension page in the marketplace
          vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.parse("vscode:extension/be5invis.vscode-custom-css")
          );
          //Add an event listener to the installation of the extension
          vscode.extensions.onDidChange(() => {
            //If the extension is installed
            if (vscode.extensions.getExtension("be5invis.vscode-custom-css")) {
              vscode.window
                .showInformationMessage(
                  "The Custom CSS and JS Loader extension has been installed/enabled so now VSCode-Animations can properly work. Reload to see changes.",
                  "Reload"
                )
                .then((value) => {
                  if (value === "Reload") {
                    vscode.commands.executeCommand(
                      "extension.installCustomCSS"
                    );
                    vscode.commands.executeCommand(
                      "workbench.action.reloadWindow"
                    );
                  }
                });
            }
          });
        }
      });
  }

  /**
   * Register the command to disable the animations
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.disableAnimations",
      () => {
        emptyCSSFile(context);
        vscode.window.showInformationMessage("Disabled Animations");
      }
    )
  );

  /**
   * Register the command to enable the animations
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.enableAnimations",
      () => {
        generateCSSFile(context);
        addToConfig(rootCSSPath);
        vscode.window.showInformationMessage("Enabled Animations");
      }
    )
  );

  /**
   * Register the command to open the animation settings in the settings menu
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.openAnimationSettings",
      () => {
        vscode.commands
          .executeCommand("workbench.action.openSettings", "animations") //Open the settings menu at the animations section
          .then(() => {
            vscode.commands.executeCommand("settings.action.focusSettingsList"); //Focus the settings list
          });
      }
    )
  );

  generateCSSFile(context); //Generate the css file (just in case)

  //Add an event listener to a configuration change
  vscode.workspace.onDidChangeConfiguration((e) => {
    //If the animations configuration changed
    if (e.affectsConfiguration("animations")) {
      generateCSSFile(context); //Generate the css file
    }
  });
}
