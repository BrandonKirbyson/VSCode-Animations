import * as vscode from "vscode";
import { addToConfig } from "./config";
import { generateCSS } from "./css";
import { initMessenger } from "./messenger";

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  //The path to the root css file which should be used for Custom CSS extension
  let rootJSPath = (
    (context.extensionPath.charAt(0) === "/" ? "file://" : "file:///") +
    context.extensionPath +
    "/dist/updateHandler.js"
  ).replace(/\\/g, "/"); //Replace all backslashes with forward slashes

  const autoInstall = vscode.workspace
    .getConfiguration("animations")
    .get("Auto-Install") as boolean; //Get the auto install setting

  initMessenger(); //Initialize the messenger (status bar item)

  generateCSS(context); //Generate the css file (just in case)

  context.subscriptions.push(
    vscode.commands.registerCommand("VSCode-Animations.getScriptPath", () => {
      vscode.env.clipboard.writeText(rootJSPath);
      vscode.window.showInformationMessage(
        `Animations Script Path Copied to Clipboard! (${rootJSPath})`
      );
    })
  );

  if (autoInstall) {
    //Add the root css file to the custom css imports
    addToConfig(rootJSPath, true).then((added) => {
      //If the root css file was added to the config
      if (added) {
        vscode.window
          .showInformationMessage(
            "Install VSCode Animations, install will reload window for animations to take effect",
            "Install",
            "Cancel"
          )
          .then((value) => {
            //If the user clicked the reload button
            if (value === "Install") {
              //Install the custom css extension
              vscode.commands
                .executeCommand("extension.installCustomCSS")
                .then(() => {
                  vscode.commands.executeCommand(
                    "workbench.action.reloadWindow"
                  ); //Reload the window
                });
            }
          });
      }
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.installAnimations",
      () => {
        //Add the root css file to the custom css imports
        addToConfig(rootJSPath).then((added) => {
          //If the root css file was added to the config
          vscode.window
            .showInformationMessage(
              "Install VSCode Animations, install will reload window for animations to take effect",
              "Install",
              "Cancel"
            )
            .then((value) => {
              //If the user clicked the reload button
              if (value === "Install") {
                //Install the custom css extension
                vscode.commands
                  .executeCommand("extension.installCustomCSS")
                  .then(() => {
                    vscode.commands.executeCommand(
                      "workbench.action.reloadWindow"
                    ); //Reload the window
                  });
              }
            });
        });
      }
    )
  );

  /**
   * Register the command to disable the animations
   */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.disableAnimations",
      () => {
        vscode.workspace
          .getConfiguration("animations")
          .update("Enabled", false, vscode.ConfigurationTarget.Global);

        generateCSS(context);
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
        vscode.workspace
          .getConfiguration("animations")
          .update("Enabled", true, vscode.ConfigurationTarget.Global);

        generateCSS(context);
        addToConfig(rootJSPath);
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

  /**
   * Register the command to open the custom animations css file
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("VSCode-Animations.openCustomCSS", () => {
      vscode.workspace
        .openTextDocument(
          vscode.Uri.file(
            context.extensionPath + "/dist/css/Custom-Animations.css"
          )
        ) //Open the custom animations css file
        .then((doc) => {
          vscode.window.showTextDocument(doc); //Show the document
        });
    })
  );

  /**
   * Register the command to update the css when the user edits the custom animations css file
   */
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      //If the document that was changed is the custom animations css file
      if (
        e.document.uri.fsPath ===
          context.extensionPath + "/dist/css/Custom-Animations.css" &&
        vscode.workspace.getConfiguration("animations").get("Custom-CSS")
      ) {
        generateCSS(context); //Generate the css file
      }
    })
  );

  //Add an event listener to a configuration change
  vscode.workspace.onDidChangeConfiguration((e) => {
    //If the animations configuration changed
    if (e.affectsConfiguration("animations")) {
      generateCSS(context); //Generate the css file
    }
  });
}
