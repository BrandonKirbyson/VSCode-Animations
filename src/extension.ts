import * as vscode from "vscode";
import { addToConfig, removeFromConfig } from "./config";
import { generateCSSFile } from "./css";

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  const rootCSSPath = "file://" + context.extensionPath + "/style.css"; //The path to the root css file which should be used for Custom CSS extension

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
   * Register the command to disable the root css file in the Custom CSS extension
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.disableAnimations",
      () => {
        //Add the root css file to the Custom CSS extension
        removeFromConfig(rootCSSPath).then(() => {
          vscode.window
            .showInformationMessage(
              "Disabled animations, reload to see changes.",
              "Reload",
              "Cancel"
            )
            .then((value) => {
              if (value === "Reload") {
                vscode.commands.executeCommand("extension.updateCustomCSS");
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
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
        //Add the root css file to the Custom CSS extension
        addToConfig(rootCSSPath).then(() => {
          vscode.window
            .showInformationMessage(
              "Enabled animations, reload to see changes.",
              "Reload",
              "Cancel"
            )
            .then((value) => {
              if (value === "Reload") {
                vscode.commands.executeCommand("extension.installCustomCSS");
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        });
      }
    )
  );

  /**
   * Register the command to update and reload the Custom CSS extension
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.updateAnimations",
      () => {
        generateCSSFile(context); //Generate the css file
        vscode.window
          .showInformationMessage(
            "Updated animations, reload to see changes.",
            "Reload",
            "Cancel"
          )
          .then((value) => {
            if (value === "Reload") {
              vscode.commands.executeCommand("extension.updateCustomCSS");
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
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
      vscode.commands.executeCommand("VSCode-Animations.updateAnimations"); //Update the animations
    }
  });
}
