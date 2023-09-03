import * as vscode from "vscode";

export enum InstallMethod {
  customCSSAndJS = "Custom CSS and JS",
  apcCustomizeUI = "Apc Customize UI++",
}

const installMethodDetails = {
  [InstallMethod.customCSSAndJS]: {
    extensionID: "be5invis.vscode-custom-css",
    extensionName: "Custom CSS and JS",
    importSetting: "vscode_custom_css.imports",
    installCommand: "extension.installCustomCSS",
    uninstallCommand: "extension.uninstallCustomCSS",
  },
  [InstallMethod.apcCustomizeUI]: {
    extensionID: "drcika.apc-extension",
    extensionName: "Apc Customize UI++",
    importSetting: "apc.imports",
    installCommand: "apc.extension.enable",
    uninstallCommand: "apc.extension.disable",
  },
};

const minHandlerVersion = "1.0.14"; // The minimum version of the update handler that is required

export class InstallationManager {
  private context: vscode.ExtensionContext;
  private installMethod: InstallMethod;
  private path: string;

  constructor(context: vscode.ExtensionContext, installMethod: InstallMethod) {
    this.context = context;
    this.installMethod = installMethod;
    this.path = this.generatePath();

    //If settings change
    vscode.workspace.onDidChangeConfiguration((event) => {
      //If the install method changes
      if (event.affectsConfiguration("animations.Install-Method")) {
        const newInstallMethod = vscode.workspace
          .getConfiguration("animations")
          .get("Install-Method") as InstallMethod; //Get the new install method from the config

        vscode.window.showInformationMessage(
          `VSCode Animations: Install Method now ${newInstallMethod}`
        );

        //Remove the old install method from the config
        this.removeFromConfig().then(() => {
          // Uninstall the old install method
          vscode.commands.executeCommand(
            installMethodDetails[this.installMethod].uninstallCommand
          );

          if (
            vscode.extensions.getExtension(
              installMethodDetails[this.installMethod].extensionID
            )
          ) {
            //Reload the window, apc will prompt to restart already
            if (this.installMethod === InstallMethod.customCSSAndJS) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          } else {
            this.installMethod = newInstallMethod;
            if (this.verifyInstallMethod()) this.install(true);
          }
        });
      }
    });
  }

  /**
   * Returns the path to the root js file of this extension
   * @returns The path to the root js file of this extension
   */
  public getPath() {
    return this.path;
  }

  /**
   * Gets the path to the root js file of this extension
   * @returns The path to the root js file
   */
  private generatePath(): string {
    return (
      (this.context.extensionPath.charAt(0) === "/" ? "file://" : "file:///") +
      this.context.extensionPath +
      "/dist/updateHandler.js"
    ).replace(/\\/g, "/");
  }

  public showInstallMethodPicker() {
    //Prompt the user to change the install method using a quick pick
    vscode.window
      .showQuickPick(
        Object.values(InstallMethod).map((value) => {
          return {
            label: value,
            description: value === this.installMethod ? "Active" : undefined,
          };
        })
      )
      .then((value) => {
        if (value?.label) {
          vscode.workspace
            .getConfiguration("animations")
            .update("Install-Method", value.label, true); //Update the install method in the settings
        }
      });
  }

  /**
   * Checks if there is an exisiting install method and sets the install method to it
   */
  public checkForInstallMethod() {
    if (
      vscode.extensions.getExtension(
        installMethodDetails[InstallMethod.customCSSAndJS].extensionID
      ) &&
      vscode.extensions.getExtension(
        installMethodDetails[InstallMethod.apcCustomizeUI].extensionID
      )
    ) {
      vscode.window
        .showErrorMessage(
          `VSCode Animations: Both Custom CSS and JS and Apc Customize UI++ are installed`,
          `Use ${InstallMethod.customCSSAndJS}`,
          `Use ${InstallMethod.apcCustomizeUI}`
        )
        .then((value) => {
          if (value === `Use ${InstallMethod.customCSSAndJS}`) {
            this.installMethod = InstallMethod.customCSSAndJS;
            vscode.workspace
              .getConfiguration("animations")
              .update("Install-Method", InstallMethod.customCSSAndJS, true);
            return;
          } else if (value === `Use ${InstallMethod.apcCustomizeUI}`) {
            this.installMethod = InstallMethod.apcCustomizeUI;
            vscode.workspace
              .getConfiguration("animations")
              .update("Install-Method", InstallMethod.apcCustomizeUI, true);
            return;
          }
        });
    }
    if (
      vscode.extensions.getExtension(
        installMethodDetails[this.installMethod].extensionID
      )
    )
      return;

    for (const installMethod of Object.values(InstallMethod)) {
      if (
        vscode.extensions.getExtension(
          installMethodDetails[installMethod].extensionID
        )
      ) {
        vscode.window.showInformationMessage(
          `VSCode Animations: Install Method is ${installMethod} given it is already installed`
        );
        this.installMethod = installMethod;
        vscode.workspace
          .getConfiguration("animations")
          .update("Install-Method", installMethod, true);
      }
    }
  }

  /**
   * Verifies that the install method is set up or prompts the user to set it up
   * @returns Whether the install method is set up
   */
  public verifyInstallMethod() {
    const installDetails = installMethodDetails[this.installMethod]; //Get the install details for the install method
    //If the extension is not installed
    if (!vscode.extensions.getExtension(installDetails.extensionID)) {
      //Show an error message prompting the user to install the extension or change the install method
      vscode.window
        .showErrorMessage(
          `VSCode Animations: Please install ${installDetails.extensionName} for animations to work`,
          `Install ${installDetails.extensionName}`,
          "Change Install Method"
        )
        .then((value) => {
          //If the user clicked the install button
          if (value === `Install ${installDetails.extensionName}`) {
            //Install the extension
            vscode.commands
              .executeCommand(
                "workbench.extensions.installExtension",
                installDetails.extensionID
              )
              .then(() => {
                vscode.commands.executeCommand("workbench.action.reloadWindow"); //Reload the window
              });
          } else if (value === "Change Install Method") {
            vscode.commands.executeCommand(
              "VSCode-Animations.changeInstallMethod"
            );
          }
        });
      return false;
    }
    return true;
  }

  /**
   * Installs the extension with the install method then prompts the user to reload the window
   */
  public install(auto = false) {
    if (!this.verifyInstallMethod()) return; //Verify that the install method is set up
    if (auto) {
      if (this.addToConfigNeeded()) {
        vscode.window
          .showInformationMessage(
            `VSCode Animations: Install Required, installation method is ${
              installMethodDetails[this.installMethod].extensionName
            }, window will reload`,
            "Install Now"
          )
          .then((value) => {
            //If the user clicked the install button
            if (value === "Install Now") {
              this.addToConfig(auto).then((added) => {
                //Run the install command for the install method
                vscode.commands.executeCommand(
                  installMethodDetails[this.installMethod].installCommand
                );
                if (this.installMethod === InstallMethod.customCSSAndJS) {
                  vscode.commands.executeCommand(
                    "workbench.action.reloadWindow"
                  ); //Reload the window
                }
              });
            }
          });
      }
    } else {
      this.addToConfig().then((added) => {
        //Run the install command for the install method
        vscode.commands.executeCommand(
          installMethodDetails[this.installMethod].installCommand
        );
        if (this.installMethod === InstallMethod.customCSSAndJS) {
          vscode.commands.executeCommand("workbench.action.reloadWindow"); //Reload the window
        }
      });
    }
  }

  /**
   * Checks if the version of the extension is allowed by checking if it is greater than or equal to the minimum version
   * @param version The version to check
   * @returns Whether the version is allowed
   */
  private isAllowedVersion(version: string) {
    const v1 = version.split(".");
    const v2 = minHandlerVersion.split(".");
    for (let i = 0; i < v1.length; i++) {
      const n1 = parseInt(v1[i]);
      const n2 = parseInt(v2[i]);
      if (n1 > n2) return true;
      if (n1 < n2) return false;
    }
    return true;
  }

  /**
   *  Adds the extension to the config of the install method
   * @param auto If this is being called automatically
   * @returns Whether the extension was added to the config
   */
  private addToConfig(auto = false): Thenable<boolean> {
    const config = vscode.workspace.getConfiguration();
    let customImports = config.get<string[]>(
      installMethodDetails[this.installMethod].importSetting
    ); //Get the current list of imports

    if (auto) {
      if (customImports && customImports.length > 0) {
        const regex = /brandonkirbyson\.vscode-animations-\d+\.\d+\.\d+/; //Regex to match the version number in the extension id
        //Loop through the list of imports
        for (let i = 0; i < customImports.length; i++) {
          const match = customImports[i].match(regex); //Get the version number from the extension id using the regex
          if (match && match.length > 0) {
            const version = match[0].split("-")[match[0].split("-").length - 1]; //Get the version number from the extension id
            if (this.isAllowedVersion(version)) {
              return Promise.resolve(false); //If the user has the minimum version installed, return false
            }
          }
        }
      }
    }

    if (customImports)
      customImports = this.removeOldConfigPaths(this.path, customImports); //Remove any old paths from the list

    //If the path is added, this will be set to true
    let pathAdded = false;

    //If the list exists and the root CSS file is not already in the list
    if (customImports && !customImports.includes(this.path)) {
      customImports.push(this.path); //Add the root CSS file to the list
      pathAdded = true;
    }
    return config
      .update(
        //Update the list of imports
        installMethodDetails[this.installMethod].importSetting,
        customImports,
        vscode.ConfigurationTarget.Global
      )
      .then(() => pathAdded); //Update the list of imp
  }

  private addToConfigNeeded() {
    const config = vscode.workspace.getConfiguration();
    let customImports = config.get<string[]>(
      installMethodDetails[this.installMethod].importSetting
    ); //Get the current list of imports

    if (customImports && customImports.length > 0) {
      const regex = /brandonkirbyson\.vscode-animations-\d+\.\d+\.\d+/; //Regex to match the version number in the extension id
      //Loop through the list of imports
      for (let i = 0; i < customImports.length; i++) {
        const match = customImports[i].match(regex); //Get the version number from the extension id using the regex
        if (match && match.length > 0) {
          const version = match[0].split("-")[match[0].split("-").length - 1]; //Get the version number from the extension id
          if (this.isAllowedVersion(version)) {
            return false; //If the user has the minimum version installed, return false
          }
        }
      }
    }
    return true;
  }

  private removeOldConfigPaths(currentPath: string, configPaths: string[]) {
    const endOfPath = "/dist/updateHandler.js";
    const endOfPathDev = "VSCode-Animations/dist/updateHandler.js";
    let cleanedConfigPaths: string[] = [];
    for (let i = 0; i < configPaths.length; i++) {
      const path = configPaths[i];
      if (path === currentPath) cleanedConfigPaths.push(path); //If the path is the current path, keep it

      if (
        (path.substring(path.length - endOfPath.length) === endOfPath || //If path ends with /dist/updateHandler.js
          path.substring(path.length - endOfPathDev.length) === endOfPathDev) && //If path ends with VSCode-Animations/dist/updateHandler.js
        (path.includes("VSCode-Animations") ||
          path.includes("brandonkirbyson.vscode-animations")) //If path contains reference to VSCode-Animations
      )
        continue;

      cleanedConfigPaths.push(path); //Keep anything that wasn't filtered out
    }
    return cleanedConfigPaths;
  }

  /**
   * Removes the extension from the config of the install method
   * @param path The path to remove from the config
   * @returns The promise of the update
   */
  private removeFromConfig(): Thenable<void> {
    const config = vscode.workspace.getConfiguration();
    const customCssImports = config.get<string[]>(
      installMethodDetails[this.installMethod].importSetting
    ); //Get the current list of imports
    if (customCssImports)
      this.removeOldConfigPaths(this.path, customCssImports);
    //If the list exists and the current path is in the list
    if (customCssImports && customCssImports.includes(this.path)) {
      customCssImports.splice(customCssImports.indexOf(this.path), 1); //Remove the current path from the list
      //Update the list of imports
      return config.update(
        installMethodDetails[this.installMethod].importSetting,
        customCssImports,
        vscode.ConfigurationTarget.Global
      ); //Returns the promise of the update
    }
    return Promise.resolve();
  }
}
