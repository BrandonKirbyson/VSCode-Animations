import * as vscode from "vscode";
import loadAnimations from "./animations";
import { getUpdatedCSS } from "./css";

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

  const cssDirectory = context.extensionPath + "/dist/css/";
  const rootCSSPath = context.extensionPath + "/style.css";

  getUpdatedCSS(["Default-Transitions.css", "test.css"], cssDirectory).then(
    (css) => {
      vscode.workspace.fs.writeFile(
        vscode.Uri.file(rootCSSPath),
        Buffer.from(css)
      );
    }
  );

  addToConfig(rootCSSPath);
}

/**
 * Adds the CSS filepath to the list of imports in the settings.json file for the Custom CSS and JS Loader extension
 * @param rootCSSPath The path to the root CSS file
 */
function addToConfig(rootCSSPath: string) {
  const config = vscode.workspace.getConfiguration();
  const customCssImports = config.get<string[]>("vscode_custom_css.imports"); //Get the current list of imports
  if (customCssImports && !customCssImports.includes(rootCSSPath)) {
    //If the list exists and the root CSS file is not already in the list
    customCssImports.push(rootCSSPath); //Add the root CSS file to the list
    config.update(
      //Update the list of imports
      "vscode_custom_css.imports",
      customCssImports,
      vscode.ConfigurationTarget.Global
    );
  }
}
