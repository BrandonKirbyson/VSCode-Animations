import { homedir } from "os";
import { join } from "path";
import { execFile } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as vscode from "vscode";

export enum InstallMethod {
  customCSSAndJS = "Custom CSS and JS",
  customUI = "Custom UI Style",
  apcCustomizeUI = "Apc Customize UI++",
}

const installMethodDetails = {
  [InstallMethod.customCSSAndJS]: {
    extensionIDs: [
      "be5invis.vscode-custom-css",
      "s-h-a-d-o-w.vscode-custom-css",
    ],
    extensionName: "Custom CSS and JS",
    importSetting: "vscode_custom_css.imports",
    installCommand: "extension.installCustomCSS",
    uninstallCommand: "extension.uninstallCustomCSS",
  },
  [InstallMethod.customUI]: {
    extensionIDs: ["subframe7536.custom-ui-style"],
    extensionName: "Custom UI Style",
    importSetting: "custom-ui-style.external.imports",
    installCommand: "custom-ui-style.reload",
    uninstallCommand: "custom-ui-style.rollback",
  },
  [InstallMethod.apcCustomizeUI]: {
    extensionIDs: ["drcika.apc-extension"],
    extensionName: "Apc Customize UI++",
    importSetting: "apc.imports",
    installCommand: "apc.extension.enable",
    uninstallCommand: "apc.extension.disable",
  },
};

type InstallMethodDetails = (typeof installMethodDetails)[InstallMethod];

const minHandlerVersion = "1.0.14"; // The minimum version of the update handler that is required

export class InstallationManager {
  private readonly context: vscode.ExtensionContext;
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

          this.installMethod = newInstallMethod;
          this.path = this.generatePath();

          if (this.isExtensionInstalled(newInstallMethod)) {
            //Reload the window, apc will prompt to restart already
            if (newInstallMethod === InstallMethod.customCSSAndJS) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          } else {
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
    //Match RFC 1738 - for the localhost, the <host> can be omitted
    //<scheme>://<host>/<resource>
    const pathScheme =
      this.context.extensionPath.charAt(0) === "/" ? "file://" : "file:///";

    //Prepare ${userHome} value for the APC
    const userHome = homedir();

    //Get extension path and handle APC optimization
    const extensionPath =
      this.installMethod === InstallMethod.apcCustomizeUI &&
      this.context.extensionPath.startsWith(userHome)
        ? // APC can utilize ${userHome}
          this.context.extensionPath.replace(userHome, "${userHome}")
        : this.context.extensionPath;

    //Concat path parts
    return (pathScheme + extensionPath + "/dist/updateHandler.js").replace(
      /\\/g,
      "/"
    );
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
      this.isExtensionInstalled(InstallMethod.customCSSAndJS) &&
      this.isExtensionInstalled(InstallMethod.apcCustomizeUI)
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
            this.path = this.generatePath();
            vscode.workspace
              .getConfiguration("animations")
              .update("Install-Method", InstallMethod.customCSSAndJS, true);
            return;
          } else if (value === `Use ${InstallMethod.apcCustomizeUI}`) {
            this.installMethod = InstallMethod.apcCustomizeUI;
            this.path = this.generatePath();
            vscode.workspace
              .getConfiguration("animations")
              .update("Install-Method", InstallMethod.apcCustomizeUI, true);
            return;
          }
        });
    }
    if (this.isExtensionInstalled(this.installMethod)) return;

    for (const installMethod of Object.values(InstallMethod)) {
      if (this.isExtensionInstalled(installMethod)) {
        vscode.window.showInformationMessage(
          `VSCode Animations: Install Method is ${installMethod} given it is already installed`
        );
        this.installMethod = installMethod;
        this.path = this.generatePath();
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
    if (!this.isExtensionInstalled(this.installMethod)) {
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
                this.getPreferredExtensionID(this.installMethod)
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
                this.runInstallCommand();
              });
            }
          });
      }
    } else {
      this.addToConfig().then((added) => {
        this.runInstallCommand();
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
    if (!customImports) customImports = [];

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

    customImports = this.removeOldConfigPaths(this.path, customImports); //Remove any old paths from the list

    //If the path is added, this will be set to true
    let pathAdded = false;

    //If the list exists and the root CSS file is not already in the list
    if (!customImports.includes(this.path)) {
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
    const cleanedImports = customCssImports
      ? this.removeOldConfigPaths(this.path, customCssImports)
      : undefined;
    //If the list exists and the current path is in the list
    if (cleanedImports && cleanedImports.includes(this.path)) {
      cleanedImports.splice(cleanedImports.indexOf(this.path), 1); //Remove the current path from the list
      //Update the list of imports
      return config.update(
        installMethodDetails[this.installMethod].importSetting,
        cleanedImports,
        vscode.ConfigurationTarget.Global
      ); //Returns the promise of the update
    }
    return Promise.resolve();
  }

  private isExtensionInstalled(installMethod: InstallMethod): boolean {
    return this.getInstalledExtensionID(installMethod) !== undefined;
  }

  private getInstalledExtensionID(
    installMethod: InstallMethod
  ): string | undefined {
    const installDetails = installMethodDetails[installMethod];
    return installDetails.extensionIDs.find((extensionID) =>
      vscode.extensions.getExtension(extensionID)
    );
  }

  private getPreferredExtensionID(installMethod: InstallMethod): string {
    const installDetails = installMethodDetails[installMethod];
    if (this.isOpenVsxHost()) {
      return this.getOpenVsxExtensionID(installDetails);
    }

    return installDetails.extensionIDs[0];
  }

  private getOpenVsxExtensionID(
    installDetails: InstallMethodDetails
  ): string {
    return (
      installDetails.extensionIDs.find((extensionID) =>
        extensionID.startsWith("s-h-a-d-o-w.")
      ) ?? installDetails.extensionIDs[0]
    );
  }

  private isOpenVsxHost(): boolean {
    const appName = vscode.env.appName.toLowerCase();
    return (
      appName.includes("vscodium") ||
      appName.includes("code - oss") ||
      appName.includes("code-oss")
    );
  }

  private runInstallCommand() {
    vscode.commands
      .executeCommand(installMethodDetails[this.installMethod].installCommand)
      .then(() => {
        if (this.installMethod === InstallMethod.customCSSAndJS) {
          this.reloadOrPatchWorkbench();
        }
      })
      .then(undefined, () => {
        if (
          this.installMethod === InstallMethod.customCSSAndJS &&
          process.platform === "win32"
        ) {
          this.installWithElevatedWorkbenchPatch();
        }
      });
  }

  private reloadOrPatchWorkbench() {
    if (this.verifyWorkbenchPatchApplied()) {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    } else if (process.platform === "win32") {
      this.installWithElevatedWorkbenchPatch();
    } else {
      this.showWorkbenchPatchError();
    }
  }

  private verifyWorkbenchPatchApplied(): boolean {
    const workbenchHTMLPath = this.getWorkbenchHTMLPath();
    if (!workbenchHTMLPath) return true;

    const workbenchHTML = readFileSync(workbenchHTMLPath, "utf-8");
    const customCssApplied =
      workbenchHTML.includes("VSCODE-CUSTOM-CSS-SESSION-ID") ||
      workbenchHTML.includes("VSCODE-ANIMATIONS-START");
    const animationsInjected =
      workbenchHTML.includes("VSCode-Animations: Successfully Installed!") ||
      workbenchHTML.includes("BrandonKirbyson.vscode-animations");

    if (customCssApplied && animationsInjected) return true;

    return false;
  }

  private getWorkbenchHTMLPath(): string | undefined {
    const appOutRoot = join(vscode.env.appRoot, "out");

    const workbenchHTMLPaths = [
      join(
        appOutRoot,
        "vs",
        "code",
        "electron-browser",
        "workbench",
        "workbench.html"
      ),
      join(
        appOutRoot,
        "vs",
        "code",
        "electron-sandbox",
        "workbench",
        "workbench.html"
      ),
    ];

    return workbenchHTMLPaths.find((path) => existsSync(path));
  }

  private installWithElevatedWorkbenchPatch() {
    const workbenchHTMLPath = this.getWorkbenchHTMLPath();
    if (!workbenchHTMLPath) {
      this.showWorkbenchPatchError();
      return;
    }

    const scriptDirectory = this.context.globalStorageUri.fsPath;
    const patchScriptPath = join(
      scriptDirectory,
      "install-vscode-animations.ps1"
    );

    mkdirSync(scriptDirectory, { recursive: true });
    writeFileSync(
      patchScriptPath,
      this.getElevatedPatchScript(workbenchHTMLPath),
      "utf-8"
    );

    const command = `Start-Process -FilePath 'powershell.exe' -Verb RunAs -Wait -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',${this.toPowerShellString(
      patchScriptPath
    )})`;

    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
      (error) => {
        if (error || !this.verifyWorkbenchPatchApplied()) {
          this.showWorkbenchPatchError();
          return;
        }

        vscode.window
          .showInformationMessage(
            "VSCode Animations: patched the workbench with administrator permission. Reload window now?",
            "Reload Window"
          )
          .then((value) => {
            if (value === "Reload Window") {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
      }
    );
  }

  private getElevatedPatchScript(workbenchHTMLPath: string): string {
    return `
$ErrorActionPreference = 'Stop'
$workbenchHTMLPath = ${this.toPowerShellString(workbenchHTMLPath)}
$updateHandlerPath = ${this.toPowerShellString(this.getPath())}
$updateHandlerPath = ([System.Uri]$updateHandlerPath).LocalPath
$backupPath = "$workbenchHTMLPath.bak-vscode-animations"

if (-not (Test-Path -LiteralPath $backupPath)) {
  Copy-Item -LiteralPath $workbenchHTMLPath -Destination $backupPath
}

$html = Get-Content -Raw -LiteralPath $workbenchHTMLPath
$html = [regex]::Replace($html, '<!-- !! VSCODE-ANIMATIONS-START !! -->[\\s\\S]*?<!-- !! VSCODE-ANIMATIONS-END !! -->\\s*', '')
$html = [regex]::Replace($html, '<!-- !! VSCODE-CUSTOM-CSS-START !! -->[\\s\\S]*?<!-- !! VSCODE-CUSTOM-CSS-END !! -->\\s*', '')
$html = [regex]::Replace($html, '<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID [\\w-]+ !! -->\\s*', '')
$html = [regex]::Replace($html, '<meta\\s+http-equiv="Content-Security-Policy"[\\s\\S]*?/>\\s*', '')

$script = Get-Content -Raw -LiteralPath $updateHandlerPath
$block = "<!-- !! VSCODE-ANIMATIONS-START !! -->\`n<script>\`n$script\`n</script>\`n<!-- !! VSCODE-CUSTOM-CSS-SESSION-ID vscode-animations-elevated !! -->\`n<!-- !! VSCODE-ANIMATIONS-END !! -->\`n"

if ($html -match '</html>') {
  $html = $html -replace '</html>', "$block</html>"
} else {
  $html = "$html\`n$block"
}

Set-Content -LiteralPath $workbenchHTMLPath -Value $html -Encoding UTF8
`.trim();
  }

  private toPowerShellString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  private showWorkbenchPatchError() {
    vscode.window.showErrorMessage(
      `VSCode Animations: ${installMethodDetails[this.installMethod].extensionName} could not modify VSCodium's workbench. Run Animations: Install Animations again and approve the administrator prompt.`
    );
  }
}
