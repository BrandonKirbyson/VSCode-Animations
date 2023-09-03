import * as vscode from "vscode";
import { generateCSS } from "./css";
import { InstallMethod, InstallationManager } from "./install";
import { initMessenger } from "./messenger";

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  const injectionMethod = vscode.workspace
    .getConfiguration("animations")
    .get("Install-Method") as InstallMethod; //Get the injection method

  //Create the installation manager that will handle the animations installation
  const installManager = new InstallationManager(context, injectionMethod);

  installManager.checkForInstallMethod(); //Check if the install method is valid

  installManager.verifyInstallMethod(); //Verify the install method, check required extension is installed

  const autoInstall = vscode.workspace
    .getConfiguration("animations")
    .get("Auto-Install") as boolean; //Get the auto install setting

  initMessenger(); //Initialize the messenger (status bar item)

  generateCSS(context); //Generate the css file

  if (autoInstall) {
    installManager.install(true);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.installAnimations",
      () => {
        installManager.verifyInstallMethod();
        installManager.install();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "VSCode-Animations.changeInstallMethod",
      () => {
        //Prompt the user to change the install method using a quick pick
        vscode.window
          .showQuickPick(Object.values(InstallMethod))
          .then((value) => {
            if (value) {
              vscode.workspace
                .getConfiguration("animations")
                .update("Install-Method", value, true); //Update the install method in the settings
            }
          });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("VSCode-Animations.getScriptPath", () => {
      vscode.env.clipboard.writeText(installManager.getPath());
      vscode.window.showInformationMessage(
        `Animations Script Path Copied to Clipboard! (${installManager.getPath()})`
      );
    })
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
